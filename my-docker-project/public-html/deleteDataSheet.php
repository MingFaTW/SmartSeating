<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "mysql";
$username = "admin";
$password = "adminpassword";
$dbname = "mydatabase";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("連接失敗: " . $conn->connect_error);
}
mysqli_set_charset($conn, "utf8mb4");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['RID'])) {
        $conn->autocommit(FALSE); 
        try {
            $RID = $conn->real_escape_string($_POST['RID']);
            $stmt1 = $conn->prepare("DELETE FROM ClassRoom WHERE ClassRoomID = ?");
            $stmt1->bind_param("i", $RID);
            $stmt1->execute();

            $stmt2 = $conn->prepare("DELETE FROM ClassRoomSeats WHERE ClassRoomID = ?");
            $stmt2->bind_param("i", $RID);
            $stmt2->execute();

            $stmt3 = $conn->prepare("DELETE FROM ClassRoomComponents WHERE ClassRoomID = ?");
            $stmt3->bind_param("i", $RID);
            $stmt3->execute();

            $conn->commit(); // 只有當上面兩個SQL都成功執行後才會應用到資料庫裡面。
            echo "成功刪除資料表";
        } catch (mysqli_sql_exception $e) {
            $conn->rollback(); // 取消之前所做的sql操作
            echo "刪除紀錄時出錯： " . $e->getMessage();
        }
        $conn->close();
    } else {
        echo "RID輸入格式錯誤了QAQ";
    }
}
?>