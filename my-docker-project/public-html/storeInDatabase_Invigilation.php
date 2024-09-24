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
        foreach ($data['ComponentsArray'] as $component) {
            $ComponentID = $component['componentId'];
            $TypeID = $component['typeId'];
            $x = $component['x'];
            $y = $component['y'];
            $Status = $component['status'];
            $StudentID = $component['studentId'];
            $StudentName = $component['studentName'];
            $ClassRoomID = $component['RID'];
            $SeatID = $component['seatId'];
            $MacAddress = $component['macAddress'];

            $EID = 1;
            $COID = 1;

            $stmt = $conn->prepare("INSERT INTO ClassRoomComponents (ComponentID, ClassRoomID, TypeID, x, y, SeatID, MacAddress)
                                    VALUES (?, ?, ?, ?, ?, ?, ?)
                                    ON DUPLICATE KEY UPDATE
                                    TypeID = VALUES(TypeID), x = VALUES(x), y = VALUES(y), SeatID = VALUES(SeatID), MacAddress = VALUES(MacAddress)");
            if ($stmt === false) {
                die("prepare() failed: " . htmlspecialchars($conn->error));
            }
            $stmt->bind_param("iiiiiss", $ComponentID, $ClassRoomID, $TypeID, $x, $y, $SeatID, $MacAddress);
            if (!$stmt->execute()) {
                die("execute() failed: " . htmlspecialchars($stmt->error));
            }
            $stmt->close();
        if(($TypeID===1)||($TypeID===2)||($TypeID===3)||($TypeID===4)){
            $stmt = $conn->prepare("INSERT INTO ExamArrangedSeats (EID, ClassRoomID ,SeatID ,COID ,StudentID, StudentName)
                                    VALUES (?, ? ,?, ?, ?, ?)
                                    ON DUPLICATE KEY UPDATE
                                    EID = VALUES(EID), COID = VALUES(COID), StudentID = VALUES(StudentID), StudentName = VALUES(StudentName)");
            if ($stmt === false) {
                die("prepare() failed: " . htmlspecialchars($conn->error));
            }
            if ($stmt === false) {
                die("prepare() failed: " . htmlspecialchars($conn->error));
            }
            $stmt->bind_param("iiiiss",$EID, $ClassRoomID, $SeatID, $COID, $StudentID, $StudentName);
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

