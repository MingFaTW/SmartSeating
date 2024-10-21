import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Transformer, Circle, Line } from 'react-konva';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Invigilation.css';
import Swal from 'sweetalert2';
const SeatChart = () => {
  // id: 座位編號 type: 型態 componentsId: 型態專用編號 x: x座標 y: y座標 SeatId: 座號 studentName: 學生姓名 studentId: 學生學號 MacAddress: Mac地址
  const [components, setComponents] = useState([]);
  //對了由於id是設成由2開始的，要進行驗證，如果要開始用的話把id設成1(nextIdRef)
  const [RID, setRID] = useState(0);
  const [status, setStatus] = useState(0);
  //考生之狀態 -1:電腦故障 0:已填入考生資訊 1:可填入考生資訊 2:已完成考試 3:考試進行中 4:外網連線考生
  const [inputSeatStatus, setInputSeatStatus] = useState("");
  const [usedSeatNum, setUsedSeatNum] = useState(0);
  const [disabledSeats, setDisabledSeats] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [selectedSeatId, setSelectedSeatId] = useState('');
  const [inputStudentId, setInputStudentId] = useState('');
  const [inputStudentName, setInputStudentName] = useState('');
  const [inputMacAddress, setInputMacAddress] = useState('');
  const [inputSeatOrientation, setInputSeatOrientation] = useState("");
  const [inputExchangeSeat2, setInputExchangeSeat2] = useState("");
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
  const [testStatus_starting ,setTestStatus_starting] = useState(0);
  const [testStatus_absent, setTestStatus_absent] = useState(0);
  const [testStatus_finished, setTestStatus_finished] = useState(0);
  const [testStatus_nonstart, setTestStatus_nonstart] = useState(0);
  


  const handleSelectedSeatTypeChange = (e) => {
    setSelectedSeatType(e.target.value);
  }  

  const handleComponentClick = (e, id) => {
    console.log('handleComponentClick', id);
    components.forEach(component => {
      if(component.componentId === id){
        if((component.typeId === 1)||(component.typeId === 2)||(component.typeId === 3)||(component.typeId === 4)){
          setSelectedSeatId(component.seatId);
        }else{
          setSelectedSeatId("");
        }
      }
    });
    setSelectedComponentId(id);
  };

  //selectedSeatType 現在用做是之前新增的選項，當選擇了leftSeat、rightSeat、frontSeat、backSeat時，輸入座位數量，並且新增相應數量的座位。
  const handleStageClick = (e) => {
    if (e.target === stageRef.current.getStage()) {
      setSelectedComponentId("");
      setSelectedSeatId("");
    }
  };

  //輸入座位坐號
  const handleTextDblClick = (componentId) => {
    const newSeatId = prompt('請輸入新的座位編號:');
    if (newSeatId) {
      const newComponents = components.map(component => {
        if (component.componentId === componentId) { 
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
    const selectedComponent = components.find(component => component.componentId === id);
    if (selectedComponent && (selectedComponent.typeId === 1 || selectedComponent.typeId === 2 || selectedComponent.typeId === 3 || selectedComponent.typeId === 4)) {
      const updatedComponents = components.map(component => {
        if (component.componentId === id) {
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
          url: 'http://localhost:8080/storeInDatabase_Invigilation.php',
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
      if (!value) {
        return '請輸入教室號碼';
      }
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      console.log("Click load btn");
      setRID(result.value);
      (async () => {
        try {
          const formData = new FormData();
          formData.append('RID', result.value);
          const response = await fetch("http://localhost:8080/loadFromDatabase_Invigilation.php", {
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
          let newNextSeatId = 0, newId = 0, usedSeatNum = 0, starting = 0, finished = 0, nonstart = 0, absent = 0;

          for(let i=0; i<data.length; i++){
            if(newNextSeatId<data[i]["seatId"])
              newNextSeatId = data[i]["seatId"];
            if(newId<data[i]["componentId"])
              newId = data[i]["componentId"];
            if((data[i]["studentId"] !== "")&&(data[i]["studentId"] !== null))
              usedSeatNum++;
            if(data[i]["status"]==="進行中")
              starting++;
            if(data[i]["status"]==="缺考")
              absent++;
            if(data[i]["status"]==="未開始")
              nonstart++;
            if(data[i]["status"]==="結束")
              finished++;
          }
          setTestStatus_absent(absent);
          setTestStatus_finished(finished);
          setTestStatus_nonstart(nonstart);
          setTestStatus_starting(starting);
          setUsedSeatNum(usedSeatNum);
          setComponents(data);
          console.log("testest");
          console.log("TestStatus_absent:",testStatus_absent);
          nextIdRef.current = parseInt(newId)+1;
          nextSeatIdRef.current = parseInt(newNextSeatId)+1;
          
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
    } else if (name === 'exchangeSeat2'){
      setInputExchangeSeat2(value);
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
        if (component.componentId === selectedComponentId) {
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
      if (component.componentId === selectedComponentId) {
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
      const selectedComponent = components.find(components => components.componentId === selectedComponentId);
      if(selectedComponent){
        setInputStudentId(selectedComponent.studentId);
        setInputStudentName(selectedComponent.studentName);
        setInputMacAddress(selectedComponent.macAddress);
        setInputSeatOrientation(selectedComponent.type);
        setInputSeatStatus(selectedComponent.status);
        setInputExchangeSeat2("");
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
      setInputExchangeSeat2("");
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
    if(status){
      switch (status) {
        case "進行中":
            return "green";
        case "結束":
            return "grey";
        case "缺考":
            return "red";
        case "未開始":
        case "":
        case null:
            return "white";
     }
    }else{
      return "white";
    }
  };

  const handleExchangeSeat = () => {
    let updatedComponents = [...components]; 
    let temp, temp1;
    updatedComponents.forEach(component => {
      if (component.seatId === selectedSeatId) {
        temp = { ...component };
      } else if (component.seatId === inputExchangeSeat2) {
        temp1 = { ...component };
      }
    });
  
    if (temp && temp1) {
      updatedComponents = updatedComponents.map(component => {
        if (component.seatId === selectedSeatId) {
          return { ...component, x: temp1.x, y: temp1.y, seatId: temp1.seatId, type: temp1.type, typeId: temp1.typeId };
        } else if (component.seatId === inputExchangeSeat2) {
          return { ...component, x: temp.x, y: temp.y, seatId: temp.seatId, type: temp.type, typeId: temp.typeId };
        }
        return component;
      });
      setComponents(updatedComponents);
    } else {
      console.error("無法找到要交換的座位QAQ");
    }
  };
  

  return (
    <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <nav className="navbar fixed-top bg-dark">
        <div className="container-fluid">
        <Link to="/HomePage" className="navbar-brand text-light">SmartSeating 座位管理系统</Link>          
        <ul className="navbar-nav d-flex flex-row align-items-center">
            <li className="nav-item">
              <button onClick={handleExportImg} className="btn btn-dark">
                <i className="bi bi-image"></i>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={handleLoadFromDb} className="btn btn-dark">
                <i className="bi bi-download"></i>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={handleSaveDb} className="btn btn-dark">
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
                  key={component.componentId}
                  id={component.componentId}
                  x={component.x}
                  y={component.y}
                  onClick={(e) => {
                    handleComponentClick(e, component.componentId);
                  }}
                >
                  {component.type === 'rightSeat' && (
                    <>
                      <Circle
                        x={135}
                        y={25}
                        radius={25}
                        fill={getFillColor(component.status)}
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Rect width={110} height={50} fill={getFillColor(component.status)} stroke="black" strokeWidth={2} />
                      <Rect x={150} y={0} width={10} height={50} fill={getFillColor(component.status)} stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={128}
                        y={20}
                        onDblClick={() => handleTextDblClick(component.componentId)}
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
                        z-index={1}
                      />
                      <Rect x={50} width={110} height={50} fill={getFillColor(component.status)} stroke="black" strokeWidth={2} />
                      <Rect x={0} y={0} width={10} height={50} fill={getFillColor(component.status)} stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={18}
                        y={20}
                        onDblClick={() => handleTextDblClick(component.componentId)}
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
                      <Rect x={30} y={-50} width={50} height={10} fill={getFillColor(component.status)} stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={48}
                        y={-30}
                        onDblClick={() => handleTextDblClick(component.componentId)}
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
                      <Rect x={30} y={90} width={50} height={10} fill={getFillColor(component.status)} stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={48}
                        y={70}
                        onDblClick={() => handleTextDblClick(component.componentId)}
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
                    value={RID}
                  />
                </form>
              </div>
              <hr/>
                <label>學生學號</label>
                <input
                  type="text"
                  className="form-control"
                  name="studentId"
                  value={inputStudentId}
                  onChange={handleInputChange}
                  disabled
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
                  disabled
                />
              </div>
              <div>
                <label>學生狀態</label>
                  <select
                    className="form-control"
                    name="status"
                    value={inputSeatStatus}
                    onChange={handleInputChange}
                    disabled
                  >
                  <option value="">請選擇</option>
                  <option value="缺考">缺考</option>
                  <option value="進行中">進行中</option>
                  <option value="結束">已結束</option>
                  <option value="未開始">未開始</option>
                  </select>
              </div>
              <hr/>
              <h5>考生調換座位</h5>
                  <label>座位號碼</label>
                  <div class="input-wrapper">
                      <input type="number" id="exchangeSeat1" name="exchangeSeat1" class="form-control seat" value={selectedSeatId} disabled/>
                      <label>&hArr;</label>
                      <input type="number" id="exchangeSeat2" name="exchangeSeat2" class="form-control seat" value={inputExchangeSeat2} onChange={handleInputChange}/>
                  </div>
                  <button id="exchangeSeat" name="exchangeSeat" class="btn btn-primary" onClick={handleExchangeSeat}>調換座位</button>
              <hr/>
              <h5>考試狀態</h5>
            <div style={{ display: "inline-block" }}>
              <div
                style={{
                  width: "25px",
                  height: "10px",
                  backgroundColor: "white",
                  display: "inline-block",
                  border: "solid"
                }}
              ></div>
              未開始考試:
              <label> {(testStatus_nonstart)}</label>
            </div>
            <div style={{ display: "inline-block" }}>
              <div
                style={{
                  width: "25px",
                  height: "10px",
                  backgroundColor: "green",
                  display: "inline-block",
                  border: "solid"
                }}
              ></div>
              考試進行中:
              <label>{(testStatus_starting)}</label>
            </div>

            <div style={{ display: "inline-block" }}>
              <div
                style={{
                  width: "25px",
                  height: "10px",
                  backgroundColor: "grey",
                  display: "inline-block",
                  border: "solid"
                }}
              ></div>
              已結束考試:
              <label>{(testStatus_finished)}</label>
            </div>

            <div style={{ display: "inline-block" }}>
              <div
                style={{
                  width: "25px",
                  height: "10px",
                  backgroundColor: "red",
                  display: "inline-block",
                  border: "solid"
                }}
              ></div>
              考生已缺考:
              <label>{(testStatus_absent)}</label>
            </div>

              <hr/>
              <div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatChart;
