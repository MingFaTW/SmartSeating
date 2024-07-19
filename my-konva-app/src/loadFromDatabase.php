<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "SE_111_1";

// 建立連接
$conn = new mysqli($servername, $username, $password, $dbname);

// 檢查連接
if ($conn->connect_error) {
    die("連接失敗: " . $conn->connect_error);
}

mysqli_set_charset($conn, "utf8mb4");

// 從POST請求中獲取RID
// $RID = isset($_POST['RID']) ? $_POST['RID'] : '';
$RID = 1008;
$RID = $conn->real_escape_string($RID);
$stmt = $conn->prepare(
    "SELECT 
    ClassRoomComponents.*,
    ClassRoomSeats.*,
    ClassRoomComponentType.*
FROM ClassRoomComponents 
INNER JOIN ClassRoomSeats
    ON ClassRoomComponents.RID = ClassRoomSeats.RID
    AND ClassRoomComponents.id = ClassRoomSeats.id
INNER JOIN ClassRoomComponentType
	ON ClassRoomComponents.typeId = ClassRoomComponentType.typeId
WHERE ClassRoomComponents.RID = ?");
$stmt->bind_param("s", $RID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $data = [];
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo "0 结果";
}
$stmt->close();
$conn->close();
?>