import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Transformer, Circle, Line } from 'react-konva';
import html2canvas from 'html2canvas';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Swal from 'sweetalert2';
const SeatChart = () => {
  // id: 座位編號 type: 型態 componentsId: 型態專用編號 x: x座標 y: y座標 SeatId: 座號 studentName: 學生姓名 studentId: 學生學號 MacAddress: Mac地址
  const [components, setComponents] = useState([
    // { id:1, type: 'leftSeat', typeId: 1, x: 50, y: 50, RID:1008 ,seatId: "1", studentName: '李明發', studentId: 'CBB110213', macAddress: '1A-2B-3C-4D-5E-6F', status: 0},
    // { id:2, type: 'rightSeat', componentsId: 2, x: 50, y: 100, SeatId: '2', studentName: '李明發', studentId: 'CBB110213', MacAddress: '1A-2B-3C-4D-5E-6F'},
    // { id:3, type: 'frontSeat', componentsId: 3, x: 50, y: 150, SeatId: '3', studentName: '李明發', studentId: 'CBB110213', MacAddress: '1A-2B-3C-4D-5E-6F'},
    // { id:4, type: 'backSeat', componentsId: 4, x: 50, y: 200, SeatId: '4', studentName: '李明發', studentId: 'CBB110213', MacAddress: '1A-2B-3C-4D-5E-6F'},
    // { id:5, type: 'whiteboard', componentsId: 5, x: 50, y: 250, SeatId: '', studentName: '', studentId: '', MacAddress: ''},
    // { id:6, type: 'door', componentsId: 6, x: 50, y: 300, SeatId: '', studentName: '', studentId: '', MacAddress: ''},
    // { id:7, type: 'window', componentsId: 7, x: 50, y: 350, SeatId: '', studentName: '', studentId: '', MacAddress: ''},
    //共有上述7種型態 1.左座位 2.右座位 3.前座位 4.後座位 5.白板 6.門 7.窗 數字對應型態專用編號
    //status: 0:idle,1:occupy,-1:disabled
  ])
  //對了由於id是設成由2開始的，要進行驗證，如果要開始用的話把id設成1(nextIdRef)
  const [RID, setRID] = useState(0);
  const [status, setStatus] = useState(0);
  const [disabledSeats, setDisabledSeats] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [inputStudentId, setInputStudentId] = useState('');
  const [inputStudentName, setInputStudentName] = useState('');
  const [inputMacAddress, setInputMacAddress] = useState('');
  const [inputSeatOrientation, setInputSeatOrientation] = useState("");
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [stageDraggable, setStageDraggable] = useState(true);
  // 新增連續放置座位和形狀的模式
  const [selectedOption, setSelectedOption] = useState("");
  // const [selectedShape, setSelectedShape] = useState("");
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

  const handleContiunuousAddSeat = (event) => { //event參數：當事件發生時該參數會自動被傳遞給這個函式，包含了事件的所有資訊，像是觸發的元素，如select元素一樣。
    setcontinuousAddSeat(event.target.value); //抓取select元素的值也就是value=active/inactive，並且設定為continuousAddSeat的值。 
    // 這裡的event.target.value是指checkbox的值，當checkbox被選中時，event.target.value的值為true，否則為false
  }

// 將 handleTypeId 函數獨立出來，以便重用
function handleTypeId(type) {
  switch (type.toLowerCase()) { // 使用 toLowerCase 確保大小寫不敏感
    case 'leftseat': return 1;
    case 'rightseat': return 2;
    case 'frontseat': return 3;
    case 'backseat': return 4;
    case 'whiteboard': return 5;
    case 'door': return 6;
    case 'window': return 7;
    default: return 0;
  }
}

  const handleDragStart = (type) => {
    setStageDraggable(false);

    const typeId = handleTypeId(type);
  
    const newComponents = {
      type: type,
      id: nextIdRef.current,
      typeId: typeId,
      x: 0,
      y: 0,
      RID: RID,
      seatId: null,
      studentName: '',
      studentId: '',
      macAddress: '',
      status: 0,
    };
  
    // 根據條件設定 SeatId，像下面的三元運算式
    // newIdRef是一個(ref)物件，通常於React中用於存取DOM node或是儲存可變的值而不會引起組件重新渲染/或是說ref儲存的數值在組件在重新渲染的過程中保持不變，除非自己改它。
    // newIdRef.current的主要作用是用來存放新的座位或形狀或是更新現有的值，...newComponent為將ref物件中的所有屬性複製到新物件中。
    newIdRef.current = {
      ...newComponents,
      seatId: (type === 'leftSeat' || type === 'rightSeat' || type === 'frontSeat' || type === 'backSeat') ? `${nextSeatIdRef.current++}` : 0
    };
  }

  //下面這一段是用作是新增component，當左側的座位被拖曳到stage上時，會在components陣列中新增一個元素，並且將newIdRef.current的值設為null。
  const handleStageMouseUp = (e) => {
    if(newIdRef.current && e.target === stageRef.current.getStage()){
      const stage = stageRef.current.getStage();
      const pointerPosition = stage.getRelativePointerPosition();
      newIdRef.current.x = pointerPosition.x;
      newIdRef.current.y = pointerPosition.y;
      setComponents([...components, newIdRef.current]);
      nextIdRef.current++;
      newIdRef.current = null;
      setStageDraggable(true);
    }
  };

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
      const stage = stageRef.current.getStage();
      const pointerPosition = stage.getPointerPosition();
      if (continuousAddSeat === "active") {
        if (['leftSeat', 'rightSeat', 'frontSeat', 'backSeat'].includes(selectedSeatType)) {
          const newComponentsArray = [];
          for (let i = 0; i < seatCount; i++) {
            let x = pointerPosition.x;
            let y = pointerPosition.y;
            switch (selectedSeatType) {
              case 'leftSeat':
                y = y + i * 50;
                break;
              case 'rightSeat':
                y = y + i * 50;
                break;
              case 'frontSeat':
                x = x + i * 100; 
                break;
              case 'backSeat':
                x = x + i * 100; 
                break;
              default:
                break;
            }
            const newComponent = {
              id: nextIdRef.current,
              type: selectedSeatType,
              typeId: handleTypeId(selectedSeatType),
              x: x, 
              y: y,
              seatId: nextSeatIdRef.current,
              studentName: '',
              studentId: '',
              macAddress: '',
              status: 0,
            };
            newComponentsArray.push(newComponent);
            nextSeatIdRef.current++;
            nextIdRef.current++;
          }
          setComponents([...components, ...newComponentsArray]);
        }
      }
    }
  };

  const handleDragEnd = (e) => {
    const id = e.target.id();
    console.log("DragEnd-id: " + id);
    // let startType = null;
    // if (id.startsWith('leftseat-')) {
    //   startType = 'leftSeat';
    // } else if (id.startsWith('rightseat-')) {
    //   startType = 'rightSeat';
    // } else if (id.startsWith('frontseat-')) {
    //   startType = 'frontSeat';
    // } else if (id.startsWith('backseat-')) {
    //   startType = 'backSeat';
    // } else if (id.startsWith('whiteboard-')) {
    //   startType = 'whiteboard';
    // } else if (id.startsWith('door-')) {
    //   startType = 'door';
    // } else if (id.startsWith('window-')) {
    //   startType = 'window';
    // }
    // const componentId = parseInt(id.replace(`${startType}-`, ''), 10); //replace(需要變更的字串,準備變更的字串)然後後面的10是指定進制
    const newComponents = components.map(component => {
      if (component.id === id) {
        return {
          ...component,
          x: e.target.x(),
          y: e.target.y()
        };
      }
      return component; // 返回原始元素，避免 undefined
    });
    setComponents(newComponents);
    setStageDraggable(true);
  }

  const handleDragMove = () => {
    setStageDraggable(false);
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

  const handleDeleteObject = (id) => {
    setComponents(components.filter(components => components.id !== id));
    setSelectedComponentId(null); // 清除選取的座位ID
  };
  
  const continuousAlignSeat = () => {

  }

  const handleExportImg = () => {
    const stage = stageRef.current.getStage().content;
    html2canvas(stage).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'screenshot.png';
      link.click();
    });
  };

  const handleSaveJSON = () => {
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
        },
        error: function (error) {
            console.log("Error: ", error);
        },
    });
};

// //使用localstorage儲存的方法，先註解使用資料庫載入
const handleLoadJSON = () => {
    console.log("click the load button");
      const json = localStorage.getItem("data");
      if (!json) {
        console.error("No data found in localStorage");
        return;
      }
    try {
      const data = JSON.parse(json);
      if (data.ComponentsArray) {
        setComponents(data.ComponentsArray);
        console.log("Data loaded successfully from localStorage");
      } 
    } catch (error) {
      console.error("Error parsing JSON from localStorage", error);
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
        }
      })();
    }
  });
};



  const handleDeleteDataSheet = async () => {
    if (RID !== 0) {
      Swal.fire({
        title: `請問是否刪除${RID}教室的資料表`,
        text: "一旦刪除，現存的資料和已規劃之座位表，將全部淨空無法恢復！",
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonColor: '#3085d6', 
        cancelButtonColor: '#d33', 
        confirmButtonText: "確認刪除", 
        cancelButtonText: "取消刪除", 
      }).then(async (result) => {
        if (result.isConfirmed) {
          setComponents([]);
          nextIdRef.current = 1;
          nextSeatIdRef.current = 1;
          try {
            const formData = new FormData();
            formData.append('RID', RID);
            const response = await fetch("http://localhost:7080/party/konva/src/deleteDataSheet.php", {
              method: 'POST',
              body: formData,
            });
            if (response.ok) {
              console.log('座位表已成功刪除');
              // 可以在這裡添加更多的UI反饋，例如刷新頁面或更新UI元素
            } else {
              console.error('刪除座位表失敗');
            }
          } catch (error) {
            console.error('刪除座位表時發生錯誤', error);
          }
        }
      });
    } else {
      console.log('無效的RID，無法刪除座位表');
    }
  };
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "classRoomId" && value.trim() === "") {
      alert("請輸入教室號碼");
      return; 
    }
    if (name === 'studentId') {
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
    } else if (name === "classRoomId") {
      setRID(value);
      const newComponents = handleAssignRID(components, value);
      setComponents(newComponents);
    }
  };

  const handleAssignRID = (components, value) => {
    return components.map(component => {
      return { ...component, RID: value };
    });
  };

  const handleAssignSeat = () => {
    if(inputSeatOrientation !== 'whiteboard' || inputSeatOrientation !== 'door' || inputSeatOrientation !== 'window'){
      const updatedComponents = components.map(component => {
        console.log('updatedComponents', component.id, selectedComponentId);
        if (component.id === selectedComponentId) {
          return {
            ...component,
            studentId: inputStudentId,
            studentName: inputStudentName,
            macAddress: inputMacAddress,
            type: inputSeatOrientation,
            status: 1,
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
    const disabledSeat = updateComponents.find(component => component.studentName === "電腦故障");
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
    }
  }, [selectedComponentId, components]);

  const handleMouseDown = (e) => {
    if (e.target === stageRef.current.getStage()) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = stagePosition.x + e.movementX;
    const newY = stagePosition.y + e.movementY;
    setStagePosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 阻止 Enter 鍵，不然整個smartSeating會重新整理，ＱＡＱ。
    }
  }



  return (
    <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <nav className="navbar fixed-top bg-dark">
        <div className="container-fluid">
          <a href="#" className="navbar-brand text-light">SmartSeating 座位管理系统</a>
          <ul className="navbar-nav d-flex flex-row align-items-center">
            <li className="nav-item">
              <button onClick={handleSaveJSON} className="btn btn-dark">
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
        <div className="col-1">
          <div className="bg-light p-3" style={{ cursor: 'grab', height: '100vh' ,overflowY: 'auto' }}>
          <div
            draggable
            onDragStart={() => handleDragStart('leftSeat')}
            style={{ width: '50px', height: '50px', backgroundColor: 'grey', margin: '5px' }}
          >
            左座位
          </div>
          <div
            draggable
            onDragStart={() => handleDragStart('rightSeat')}
            style={{ width: '50px', height: '50px', backgroundColor: 'grey', margin: '5px' }}
          >
            右座位
          </div>
          <div
            draggable
            onDragStart={() => handleDragStart('frontSeat')}
            style={{ width: '50px', height: '50px', backgroundColor: 'grey', margin: '5px' }}
          >
            前座位
          </div>
          <div
            draggable
            onDragStart={() => handleDragStart('backSeat')}
            style={{ width: '50px', height: '50px', backgroundColor: 'grey', margin: '5px' }}
          >
            後座位
          </div>
          <div
            draggable
            onDragStart={() => handleDragStart('whiteboard')}
            style={{width: '50px',height: '50px', backgroundColor: 'grey', margin: '5px'}}
          >
            白板
          </div>
          <div
            draggable
            onDragStart={() => handleDragStart('door')}
            style={{width: '50px',height: '50px', backgroundColor: 'grey', margin: '5px'}}
          >
            門
          </div>
          <div
            draggable
            onDragStart={() => handleDragStart('window')}
            style={{width: '50px',height: '50px', backgroundColor: 'grey', margin: '5px'}}
          >
            窗
          </div>
          </div>
        </div>
        <div className="col-9">
          <div
            onMouseDown={handleMouseDown}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              height: '100vh',
              overflow: 'hidden',
            }}
          >
            <Stage 
              ref={stageRef}
              width={stageWidth}
              height={stageHeight}
              //draggable={stageDraggable}
              x={stagePosition.x}
              y={stagePosition.y}
              onClick={handleStageClick}
              onMouseUp={handleStageMouseUp}
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
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, component.id)}
                  onDragMove={handleDragMove}
                  onClick={(e) => handleComponentClick(e, component.id)}
                >
                  {component.type === 'rightSeat' && (
                    <>
                      <Rect width={110} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Circle
                        x={135}
                        y={25}
                        radius={25}
                        fill="white"
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
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Rect x={50} width={110} height={50} fill="white" stroke="black" strokeWidth={2} />
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
                      <Rect width={110} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Circle
                        x={55}
                        y={-25}
                        radius={25}
                        fill="white"
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
                      <Rect width={110} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Circle
                        x={55}
                        y={75}
                        radius={25}
                        fill="white"
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
                  {component.type === 'whiteboard' && (
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
                    placeholder={RID}
                    style={{ width: '150px' }}
                  />
                </form>
                <button onClick={handleDeleteDataSheet} className="btn btn-primary">
                   刪除
                </button>
              </div>
              <form> 
              <div>
                  <label>啟用連續新增座位：</label>
                  <select id='seatAddingOption' value={continuousAddSeat} onChange={handleContiunuousAddSeat}>
                    <option value="inactive">
                      否
                    </option>
                    <option value="active">
                      是
                    </option>
                  </select>
              </div>
                <div>
                  <label>
                    新增座位數量:
                  </label>
                  <input type="text"
                        className="form-control"
                        name="mutiSeatSelected"
                        id="addNewSeatNum"
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        // 主要是因為input位於form內，所以按下Enter時會觸發form的submit，所以要阻止enter。
                    />
                </div>
              <div>
                <input type="radio"
                      name="mutiSeatSelected"
                      id="selectedLeftSeat" 
                      value="leftSeat"
                      onChange={handleSelectedSeatTypeChange}
                />
                <label htmlFor="selectedLeftSeat">左座位</label>
                <input type="radio"
                      name="mutiSeatSelected"
                      id="selectedRightSeat"
                      value="rightSeat"
                      onChange={handleSelectedSeatTypeChange}
                />
                <label htmlFor="selectedRightSeat">右座位</label>
              </div>
              <div>
                <input type="radio"
                      name="mutiSeatSelected" 
                      id="selectedfrontSeat" 
                      value="frontSeat"
                      onChange={handleSelectedSeatTypeChange}
                />
                <label htmlFor="selectedFrontSeat">前座位</label>
                <input type="radio"
                      name="mutiSeatSelected" 
                      id="selectedBackSeat" 
                      value="backSeat"
                      onChange={handleSelectedSeatTypeChange}
                />
                <label htmlFor="selectedBackSeat">後座位</label>
              </div>
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
              <div className="form-group mb-3">
                <label>座位方向</label>
                <select
                  className="form-control"
                  name="seatOrientation"
                  value={inputSeatOrientation}
                  onChange={handleInputChange}
                >
                  <option value="" onChange={handleInputChange}>請選擇</option>
                  <option value="leftSeat" onChange={handleInputChange}>向左</option>
                  <option value="rightSeat" onChange={handleInputChange}>向右</option>
                  <option value="frontSeat" onChange={handleInputChange}>向後</option>
                  <option value="backSeat" onChange={handleInputChange}>向前</option>
                </select>
              </div>
              <button onClick={handleAssignSeat} className="btn btn-primary">
                資訊填入
              </button>
              <button 
                onClick={() => handleDeleteObject(selectedComponentId)} 
                className="btn btn-primary"
                disabled={!selectedComponentId} // 當未選擇座位或形狀時禁用按鈕
              >
                刪除
              </button>
              
              <button onClick={handleDisableSeat} className="btn btn-primary">
                電腦故障
              </button>
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
