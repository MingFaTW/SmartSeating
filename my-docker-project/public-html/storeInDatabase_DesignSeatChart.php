<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$servername = "mysql";  // Docker service name
$username = "admin";
$password = "adminpassword";
$dbname = "mydatabase";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("連接失敗: " . $conn->connect_error);
}
mysqli_set_charset($conn, "utf8mb4");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if ($data && isset($data['ComponentsArray'])) {
        $ClassRoomID = $data['ComponentsArray'][0]['RID'];
        $stmt1 = $conn->prepare("DELETE FROM ClassRoom WHERE ClassRoomID = ?");
        $stmt1->bind_param("i", $ClassRoomID);
        $stmt1->execute();
    
        $stmt2 = $conn->prepare("DELETE FROM ClassRoomSeats WHERE ClassRoomID = ?");
        $stmt2->bind_param("i", $ClassRoomID);
        $stmt2->execute();
    
        $stmt3 = $conn->prepare("DELETE FROM ClassRoomComponents WHERE ClassRoomID = ?");
        $stmt3->bind_param("i", $ClassRoomID);
        $stmt3->execute();
        foreach ($data['ComponentsArray'] as $component) {
            $ComponentID = $component['componentId'];
            $TypeID = $component['typeId'];
            $x = $component['x'];
            $y = $component['y'];
            $Status = $component['status'];
            $StudentID = $component['studentId'];
            $ClassRoomID = $component['RID'];
            $SeatID = $component['seatId'];
            $MacAddress = $component['macAddress'];
        
            $stmt = $conn->prepare("INSERT INTO ClassRoomComponents (ComponentID, ClassRoomID, TypeID, x, y, SeatID, MacAddress)
                                    VALUES (?, ?, ?, ?, ?, ?, ?)
                                    ON DUPLICATE KEY UPDATE
                                    ClassRoomID = VALUES(ClassRoomID), TypeID = VALUES(TypeID), x = VALUES(x), y = VALUES(y), SeatID = VALUES(SeatID), MacAddress = VALUES(MacAddress)");
            if ($stmt === false) {
                die("prepare() failed: " . htmlspecialchars($conn->error));
            }
            $stmt->bind_param("iiiiiss", $ComponentID, $ClassRoomID, $TypeID, $x, $y, $SeatID, $MacAddress);
            if (!$stmt->execute()) {
                die("execute() failed: " . htmlspecialchars($stmt->error));
            }
            $stmt->close();

        if (isset($data['Width']) && isset($data['Height']) && isset($data['seatNum'])) {
            $Name = "";
            $Width = $data['Width'];
            $Height = $data['Height'];
            $SeatNum = $data['seatNum'];
            $stmt = $conn->prepare("INSERT INTO ClassRoom (ClassRoomID, SeatNum, Name, Width, Height)
                                    VALUES (?, ?, ?, ?, ?)
                                    ON DUPLICATE KEY UPDATE
                                    SeatNum = VALUES(SeatNum), Name = VALUES(Name), Width = VALUES(Width), Height = VALUES(Height)");
            if ($stmt === false) {
                die("prepare() failed: " . htmlspecialchars($conn->error));
            }
            $stmt->bind_param("iisii", $ClassRoomID, $SeatNum, $Name, $Width, $Height);
            if (!$stmt->execute()) {
                die("execute() failed: " . htmlspecialchars($stmt->error));
            }
            $stmt->close();
        }

        if(($TypeID===1)||($TypeID===2)||($TypeID===3)||($TypeID===4)){
            $stmt = $conn->prepare("INSERT INTO ClassRoomSeats (ClassRoomID, SeatID, Status)
                                    VALUES (?, ?, ?)
                                    ON DUPLICATE KEY UPDATE
                                    ClassRoomID = VALUES(ClassRoomID), SeatID = VALUES(SeatID), Status = VALUES(Status)");
            if ($stmt === false) {
                die("prepare() failed: " . htmlspecialchars($conn->error));
            }
            if ($stmt === false) {
                die("prepare() failed: " . htmlspecialchars($conn->error));
            }
            $stmt->bind_param("iis",$ClassRoomID, $SeatID ,$Status);
            if (!$stmt->execute()) {
                die("execute() failed: " . htmlspecialchars($stmt->error));
            }
            $stmt->close();
        }
    }
        $response = array("status" => "success", "message" => "Data transmitted to database.");
        echo json_encode($response);
    } else {
        $response = array("status" => "error", "message" => "Invalid data format.");
        echo json_encode($response);
    }
} else {
    $response = array("status" => "error", "message" => "Invalid request method.");
    echo json_encode($response);
}

$conn->close();

