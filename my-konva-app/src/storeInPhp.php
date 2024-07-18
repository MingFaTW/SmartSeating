<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "SE_111_1";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("連接失敗: " . $conn->connect_error);
}
mysqli_set_charset($conn, "utf8mb4");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $RID = 0;
    if ($data && isset($data['ComponentsArray'])) {
        foreach ($data['ComponentsArray'] as $component) {
            $id = $component['id'];
            $typeId = $component['typeId'];
            $x = $component['x'];
            $y = $component['y'];
            $RID = $component['RID'];
            $seatId = $component['seatId'];
            $studentName = $component['studentName'];
            $studentId = $component['studentId'];
            $macAddress = $component['macAddress'];
            $status = $component['status'];

            $stmt = $conn->prepare("INSERT INTO ClassRoomComponents (id, typeId, x, y, macAddress, RID)
                                    VALUES (?, ?, ?, ?, ?, ?)
                                    ON DUPLICATE KEY UPDATE
                                    typeId = VALUES(typeId), x = VALUES(x), y = VALUES(y), macAddress = VALUES(macAddress), RID = VALUES(RID)");
            $stmt->bind_param("isiisi", $id, $typeId, $x, $y, $macAddress, $RID);
            $stmt->execute();

            if($seatId !== null){
                $stmt = $conn->prepare("INSERT INTO ClassRoomSeats (RID, id, seatId, studentId, studentName, status)
                                        VALUES (?, ?, ?, ?, ?, ?)
                                        ON DUPLICATE KEY UPDATE
                                        RID = VALUES(RID), id = VALUES(id), seatId = VALUES(seatId), studentId = VALUES(studentId), studentName = VALUES(studentName),
                                        status = VALUES(status)");
                $stmt->bind_param("iisssi", $RID, $id, $seatId, $studentId, $studentName, $status);
                $stmt->execute();
            }
        }
        if (isset($data['Width']) && isset($data['Height']) && isset($data['seatNum'])){
            $Name = "";
            $Width = $data['Width'];
            $Height = $data['Height'];
            $seatNum = $data['seatNum'];
            $stmt = $conn->prepare("INSERT INTO ClassRoom (RID, SeatNum, Name, Width, Height)
                                    VALUES (?, ?, ?, ?, ?)
                                    ON DUPLICATE KEY UPDATE
                                    SeatNum = VALUES(SeatNum), Name = VALUES(Name), Width = VALUES(Width), Height = VALUES(Height)");
            $stmt->bind_param("iisii", $RID, $seatNum, $Name, $Width, $Height);
            $stmt->execute();
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
?>