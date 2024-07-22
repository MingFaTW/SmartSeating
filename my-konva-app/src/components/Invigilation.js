import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Transformer, Circle, Line } from 'react-konva';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Swal from 'sweetalert2';
const SeatChart = () => {
  // id: 座位編號 type: 型態 componentsId: 型態專用編號 x: x座標 y: y座標 SeatId: 座號 studentName: 學生姓名 studentId: 學生學號 MacAddress: Mac地址
  const [components, setComponents] = useState([]);
  //對了由於id是設成由2開始的，要進行驗證，如果要開始用的話把id設成1(nextIdRef)
  const [RID, setRID] = useState(0);
  const [status, setStatus] = useState(0);
  //考生之狀態 -1:電腦故障 0:已填入考生資訊 1:可填入考生資訊 2:已完成考試 3:考試進行中 4:外網連線考生
  const [inputSeatStatus, setInputSeatStatus] = useState(1);
  const [disabledSeats, setDisabledSeats] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [inputStudentId, setInputStudentId] = useState('');
  const [inputStudentName, setInputStudentName] = useState('');
  const [inputMacAddress, setInputMacAddress] = useState('');
  const [inputSeatOrientation, setInputSeatOrientation] = useState("");
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [seatCount, setSeatCount] = useState(0);
  const [selectedSeatType, setSelectedSeatType] = useState("");
  const [stageWidth, setStageWidth] = useState(1200);
  const [stageHeight, setStageHeight] = useState(1000);
  const stageRef = useRef(null);
  const nextSeatIdRef = useRef(1);
  const nextIdRef = useRef(1); //useRef是React的Hook，用於在React組件的整個生命週期中保存數值。
  const newIdRef = useRef(null);
  const transformerRef = useRef(null);
  const [continuousAddSeat, setcontinuousAddSeat] = useState("inactive");


  const handleSelectedSeatTypeChange = (e) => {
    setSelectedSeatType(e.target.value);
  }  

  const handleComponentClick = (e, id) => {
    console.log('handleComponentClick', id);
    setSelectedComponentId(id);
  };

  //selectedSeatType 現在用做是之前新增的選項，當選擇了leftSeat、rightSeat、frontSeat、backSeat時，輸入座位數量，並且新增相應數量的座位。
  const handleStageClick = (e) => {
    if (e.target === stageRef.current.getStage()) {
      setSelectedComponentId(null);
    }
  };

  //輸入座位坐號
  const handleTextDblClick = (componentId) => {
    const newSeatId = prompt('請輸入新的座位編號:');
    if (newSeatId) {
      const newComponents = components.map(component => {
        if (component.id === componentId) { 
          return {
            ...component,
            seatId: newSeatId
          };
        }
        return component;
      });
      setComponents(newComponents);
    }
  };

  const handleDeleteSeatInfo = (id) => {
    const selectedComponent = components.find(component => component.id === id);
    if (selectedComponent && (selectedComponent.typeId === 1 || selectedComponent.typeId === 2 || selectedComponent.typeId === 3 || selectedComponent.typeId === 4)) {
      const updatedComponents = components.map(component => {
        if (component.id === id) {
          return {
            ...component,
            studentId: "",
            studentName: "",
            macAddress: "",
            status: 0,
          };
        }
        return component;
      });
      setComponents(updatedComponents);
    }
  };

  const handleExportImg = () => {
    const stage = stageRef.current.getStage().content;
    html2canvas(stage).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'screenshot.png';
      link.click();
    });
  };

  const handleSaveDb = () => {
    if(RID===0){
      Swal.fire({
        title: `請輸入教室號碼在進行儲存`,
        icon: 'warning',  
      })
    }else{
      const data = {
        ComponentsArray: components,
      };
      console.log(data.ComponentsArray);
      const dataStr = JSON.stringify(data);
      localStorage.setItem("data", dataStr);
      console.log("Data saved to localStorage");
      console.log(dataStr);
      $.ajax({
          url: 'http://localhost:7080/party/konva/src/storeInPhp.php',
          type: 'POST',
          contentType: 'application/json', 
          data: JSON.stringify({ ComponentsArray: data.ComponentsArray }), 
          success: function (response) {
              console.log("Data transmitted to database.");
              console.log(response); 
              Swal.fire({
                title: `資料已成功儲存至`+RID+`教室`,
                showCancelButton: true,
              })
          },
          error: function (error) {
              console.log("Error: ", error);
          },
      });
    }
};

const handleLoadFromDb = () => {
  Swal.fire({
    title: '輸入教室號碼',
    input: 'text',
    inputLabel: '教室號碼',
    inputPlaceholder: '請輸入教室號碼',
    showCancelButton: true,
    confirmButtonText: '載入座位表',
    cancelButtonText: '取消',
    inputValidator: (value) => {
      setRID(value)
      if (!value) {
        return '請輸入教室號碼';
      }
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      console.log("Click load btn");
      (async () => {
        try {
          const formData = new FormData();
          formData.append('RID', result.value);
          const response = await fetch("http://localhost:7080/party/konva/src/loadFromDatabase.php", {
            method: "POST", 
            body: formData, 
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
            Swal.fire({
              title: `網路出現錯誤`,
              icon: 'warning',  
            })
          }
          const data = await response.json();
          console.log("This is data: ")
          console.log(data);
          let newNextSeatId = 0;
          let newId = 0;
          for(let i=data.length-1;i>=0;i--){
            if(newNextSeatId<data[i]["seatId"])
              newNextSeatId = data[i]["seatId"];
            if(newId<data[i]["id"])
              newId = data[i]["id"];
            console.log("data back to front:"+data[i]["seatId"]);
          }
          nextIdRef.current = parseInt(newId)+1;
          nextSeatIdRef.current = parseInt(newNextSeatId)+1;
          setComponents(data);
        } catch (error) {
          console.error("Error fetching data from db:", error);
          Swal.fire({
            title: `未有${RID}教室座位表`,
            icon: 'warning',  
          })
        }
      })();
    }
  });
};

  // const handleDeleteDataSheet = async () => {
  //   if (RID !== 0) {
  //     Swal.fire({
  //       title: `請問是否刪除${RID}教室的資料表`,
  //       text: "一旦刪除，現存的資料和已規劃之座位表，將全部淨空無法恢復！",
  //       icon: 'warning', 
  //       showCancelButton: true, 
  //       confirmButtonColor: '#3085d6', 
  //       cancelButtonColor: '#d33', 
  //       confirmButtonText: "確認刪除", 
  //       cancelButtonText: "取消刪除", 
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         setComponents([]);
  //         nextIdRef.current = 1;
  //         nextSeatIdRef.current = 1;
  //         try {
  //           const formData = new FormData();
  //           formData.append('RID', RID);
  //           const response = await fetch("http://localhost:7080/party/konva/src/deleteDataSheet.php", {
  //             method: 'POST',
  //             body: formData,
  //           });
  //           if (response.ok) {
  //             console.log('座位表已成功刪除');
  //             // 可以在這裡添加更多的UI反饋，例如刷新頁面或更新UI元素
  //           } else {
  //             console.error('刪除座位表失敗');
  //           }
  //         } catch (error) {
  //           console.error('刪除座位表時發生錯誤', error);
  //         }
  //       }
  //     });
  //   } else {
  //     console.log('無效的RID，無法刪除座位表');
  //   }
  // };
  
  const statusOptions = [
    {label: '請選擇'},
    {value: 2, label: '考試未進行'},
    {value: 3, label: '考試進行中'},
    {value: 4, label: '電腦發生故障'},
    {value: 5, label: '外網連線考生'},
  ];

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "classRoomId") {
      if (value.trim() === "") {
        alert("請輸入教室號碼");
        return;
      }
      setRID(value);
      const newComponents = handleAssignRID(components, value);
      setComponents(newComponents);
    } else if (name === 'studentId') {
      setInputStudentId(value);
    } else if (name === 'studentName') {
      setInputStudentName(value);
    } else if (name === 'macAddress') {
      setInputMacAddress(value);
    } else if (name === 'Width') {
      setStageWidth(value);
    } else if (name === 'Height') {
      setStageHeight(value);
    } else if (name === 'mutiSeatSelected') {
      setSeatCount(value);
    } else if (name === 'seatOrientation') {
      setInputSeatOrientation(value);
    } else if (name === 'status'){
      setInputSeatStatus(value);
    } 
  };

  const handleAssignRID = (components, value) => {
    return components.map(component => {
      return { ...component, RID: value };
    });
  };
  const handleAssignSeat = () => {
    if(inputSeatOrientation !== 'whiteBoard' || inputSeatOrientation !== 'door' || inputSeatOrientation !== 'window'){
      const updatedComponents = components.map(component => {
        //if ((inputSeatStatus!==2)||(inputSeatStatus!==3)||(inputSeatStatus!==4)||(inputSeatStatus!==5)) inputSeatStatus=1;
        if (component.id === selectedComponentId) {
            return {
              ...component,
              studentId: inputStudentId,
              studentName: inputStudentName,
              macAddress: inputMacAddress,
              status: inputSeatStatus
            };
        }
        return component;
      });
      setComponents(updatedComponents);
    }
  };

  const handleDisableSeat = () => {
    const updateComponents = components.map(component => {
      if (component.id === selectedComponentId) {
        let newStatus = component.status;
        let newStudentName = component.studentName;
        if(component.status === 1||component.status === 0){
          newStatus = -1;
          newStudentName = '電腦故障';
        }else{
          newStatus = 0;
          newStudentName = '';
        }
        return {
          ...component,
          studentName: newStudentName,
          studentId: '',
          status: newStatus,
        };
      }
      return component; // 修正：確保不匹配的組件被正確返回
    });
    const disabledSeat = updateComponents.find(component => component .studentName === "電腦故障");
    setDisabledSeats([...disabledSeats, disabledSeat]);
    setComponents(updateComponents);
  };


  useEffect(() => {
    if(selectedComponentId !== null){
      const selectedComponent = components.find(components => components.id === selectedComponentId);
      if(selectedComponent){
        setInputStudentId(selectedComponent.studentId);
        setInputStudentName(selectedComponent.studentName);
        setInputMacAddress(selectedComponent.macAddress);
        setInputSeatOrientation(selectedComponent.type);
        setInputSeatStatus(selectedComponent.status)
        // 遍歷 components 以找出所有 studentName 為 "電腦故障" 的組件
        const updatedDisabledSeats = components.filter(component => component.studentName === "電腦故障");
        // 使用找到的組件更新 disabledSeats 狀態
        setDisabledSeats(updatedDisabledSeats);
      }
    }else{
      setInputStudentId('');
      setInputStudentName('');
      setInputMacAddress('');
      setInputSeatOrientation("");
      setInputSeatStatus("");
    }
  }, [selectedComponentId, components]);
  const handleMouseMove = (e) => {
  };

  const handleMouseUp = () => {
  };

  const handleMouseDown = (e) => {
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 阻止 Enter 鍵，不然整個smartSeating會重新整理，ＱＡＱ。
    }
  }

  const getFillColor = (status) => {
    switch (status) {
      case 2: return "green";
      case "2": return "green"
      case 3: return "grey";
      case "3": return "grey";
      case -1: return "yellow";
      case "-1": return "yellow"
      case 4: return "red";
      case "4": return "red";
      default: return "white";
    }
  };

  return (
    <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <nav className="navbar fixed-top bg-dark">
        <div className="container-fluid">
        <Link to="/home-page" className="navbar-brand text-light">SmartSeating 座位管理系统</Link>          <ul className="navbar-nav d-flex flex-row align-items-center">
            <li className="nav-item">
              <button onClick={handleSaveDb} className="btn btn-dark">
                <i className="bi bi-download"></i>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={handleExportImg} className="btn btn-dark">
                <i className="bi bi-image"></i>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={handleLoadFromDb} className="btn btn-dark">
                <i className="bi bi-upload"></i>
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <div className="row mt-5 pt-3">
        <div className="col-10">
          <div
            onMouseDown={handleMouseDown}
            style={{
              height: '100vh',
              overflow: 'hidden',
            }}
          >
            <Stage 
              ref={stageRef}
              width={stageWidth}
              height={stageHeight}
              x={stagePosition.x}
              y={stagePosition.y}
              onClick={handleStageClick}
              style={{
                border: '2px solid black',  // 增加外框線
                padding: '10px'  // 增加內邊距
              }}
            >
              <Layer>
              {components.map((component) => (
                <Group
                  key={component.id}
                  id={component.id}
                  x={component.x}
                  y={component.y}
                  onClick={(e) => handleComponentClick(e, component.id)}
                >
                  {component.type === 'rightSeat' && (
                    <>
                      <Rect width={110} height={50} fill={getFillColor(component.status)}  stroke="black" strokeWidth={2} />
                      <Circle
                        x={135}
                        y={25}
                        radius={25}
                        fill={getFillColor(component.status)}
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={128}
                        y={20}
                        onDblClick={() => handleTextDblClick(component.id)}
                      />
                      <Text
                        text={component.studentName}
                        fontSize={12}
                        fill="black"
                        x={30}
                        y={10}
                      />
                      <Text
                        text={component.studentId}
                        fontSize={12}
                        fill="black"
                        x={20}
                        y={25}
                      />
                      <Text
                        text={component.macAddress}
                        fontSize={12}
                        fill="black"
                        x={0}
                        y={35}
                      />
                    </>
                  )}
                  {component.type === 'leftSeat' && (
                    <>
                      <Circle
                        x={25}
                        y={25}
                        radius={25}
                        fill={getFillColor(component.status)}                        
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Rect x={50} width={110} height={50} fill={getFillColor(component.status)} stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={18}
                        y={20}
                        onDblClick={() => handleTextDblClick(component.id)}
                      />
                      <Text
                        text={component.studentName}
                        fontSize={12}
                        fill="black"
                        x={80}
                        y={10}
                      />
                      <Text
                        text={component.studentId}
                        fontSize={12}
                        fill="black"
                        x={75}
                        y={25}
                      />
                      <Text
                        text={component.macAddress}
                        fontSize={12}
                        fill="black"
                        x={50}
                        y={35}
                      />
                    </>
                  )}
                  {component.type === 'frontSeat' && (
                    <>
                      <Rect width={110} height={50} fill={getFillColor(component.status)} stroke="black" strokeWidth={2} />
                      <Circle
                        x={55}
                        y={-25}
                        radius={25}
                        fill={getFillColor(component.status)}                        
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={48}
                        y={-30}
                        onDblClick={() => handleTextDblClick(component.id)}
                      />
                      <Text
                        text={component.studentName}
                        fontSize={12}
                        fill="black"
                        x={33}
                        y={5}
                      />
                      <Text
                        text={component.studentId}
                        fontSize={12}
                        fill="black"
                        x={25}
                        y={20}
                      />
                      <Text
                        text={component.macAddress}
                        fontSize={12}
                        fill="black"
                        x={0}
                        y={30}
                      />
                    </>
                  )}
                  {component.type === 'backSeat' && (
                    <>
                      <Rect width={110} height={50} fill={getFillColor(component.status)} stroke="black" strokeWidth={2} />
                      <Circle
                        x={55}
                        y={75}
                        radius={25}
                        fill={getFillColor(component.status)}                        
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={48}
                        y={70}
                        onDblClick={() => handleTextDblClick(component.id)}
                      />
                      <Text
                        text={component.studentName}
                        fontSize={12}
                        fill="black"
                        x={33}
                        y={5}
                      />
                      <Text
                        text={component.studentId}
                        fontSize={12}
                        fill="black"
                        x={25}
                        y={20}
                      />
                      <Text
                        text={component.macAddress}
                        fontSize={12}
                        fill="black"
                        x={0}
                        y={30}
                      />
                    </>
                  )}
                  {component.type === 'whiteBoard' && (
                    <>
                      <Rect width={200} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Text text={`白板`} fontSize={12} fill="black" x={80} y={20} />
                    </>
                  )}
                  {component.type === 'door' && (
                    <>
                      <Rect width={60} height={100} fill="white" stroke="black" strokeWidth={2} />
                      <Line
                        points={[30, 0, 30, 100]} // Vertical line in the middle of the door
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Circle
                        x={15}
                        y={50}
                        radius={5}
                        fill="black"
                      />
                    </>
                  )}
                  {component.type === 'window' && (
                    <>
                      <Rect width={60} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Text text={`窗`} fontSize={12} fill="black" x={18} y={20} />
                    </>
                  )}
                </Group>
              ))}
                <Transformer ref={transformerRef} />
              </Layer>
            </Stage>
          </div>
        </div>
        <div className="col-2">
        {(
            <div>
              <div>
              <div>
                <label htmlFor="classRoomId">教室號碼:</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <form>
                  <input 
                    type="number"
                    id="classRoomId"
                    name="classRoomId"
                    className="form-control"
                    onChange={handleInputChange} 
                    onKeyDown={handleKeyPress}
                  />
                </form>
              </div>
              <form> 
              <div>
                <label>可用座位/座位總數 : {(nextSeatIdRef.current-1)-(disabledSeats.length)}/{(nextSeatIdRef.current-1)}</label>
              </div>
              </form>
                <label>學生學號</label>
                <input
                  type="text"
                  className="form-control"
                  name="studentId"
                  value={inputStudentId}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>學生姓名</label>
                <input
                  type="text"
                  className="form-control"
                  name="studentName"
                  value={inputStudentName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Mac Address</label>
                <input
                  type="text"
                  className="form-control"
                  name="macAddress"
                  value={inputMacAddress}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>學生狀態</label>
                  <select
                    className="form-control"
                    name="status"
                    value={inputSeatStatus}
                    onChange={handleInputChange}
                  >
                    <option value="">請選擇</option>
                    <option value="0">未輸入考生資訊</option>
                    <option value="1">已輸入考生資訊</option>
                    <option value="2">考試進行中</option>
                    <option value="3">考試已結束</option>
                    <option value="-1">電腦發生故障</option>
                    <option value="4">外網連線考生</option>
                  </select>
              </div>
              <button onClick={handleAssignSeat} className="btn btn-primary">
                資訊填入
              </button>
              <button 
                onClick={() => handleDeleteSeatInfo(selectedComponentId)} 
                className="btn btn-primary"
                disabled={!selectedComponentId} // 當未選擇座位或形狀時禁用按鈕
              >
                刪除
              </button>
              {/* <button onClick={handleDisableSeat} className="btn btn-primary">
                電腦故障
              </button> */}
              <div>
                <div>
                  <label>教室寬度:</label>                
                  <input
                    name = "Width"
                    value={stageWidth}
                    onChange={handleInputChange}
                    style={{width: '150px'}}
                  />
                </div>
                <div>
                <label>教室高度:</label>       
                  <input
                    name = "Height"
                    value={stageHeight}
                    onChange={handleInputChange}
                    style={{width: '150px'}}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatChart;
