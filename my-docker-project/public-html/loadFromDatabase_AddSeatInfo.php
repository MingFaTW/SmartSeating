<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$servername = "mysql";  // Docker service name
$username = "admin";
$password = "adminpassword";
$dbname = "mydatabase";

// Create a connection to the database
$conn1 = new mysqli($servername, $username, $password, $dbname);

// Check for connection errors
if ($conn1->connect_error) {
    die("Connection to database failed: " . $conn1->connect_error);
}

// Set character set to utf8mb4
mysqli_set_charset($conn1, "utf8mb4");

// Check if ClassRoomID is set in POST request
$ClassRoomID = isset($_POST['RID']) ? $_POST['RID'] : '';
$ClassRoomID = $conn1->real_escape_string($ClassRoomID);  // Escaping input
// Prepare the SQL statement
$sql = "
    SELECT
        ClassRoomComponents.*,
        ClassRoomComponentType.Type,
        ExamArrangedSeats.StudentID,
        ExamArrangedSeats.StudentName,
        ExamStuStatus.status
    FROM ClassRoomComponents 
    LEFT JOIN ClassRoomSeats
        ON ClassRoomComponents.ClassRoomID = ClassRoomSeats.ClassRoomID
        AND ClassRoomComponents.SeatID = ClassRoomSeats.SeatID
    LEFT JOIN ClassRoomComponentType
        ON ClassRoomComponents.TypeID = ClassRoomComponentType.TypeID
    LEFT JOIN ExamArrangedSeats
        ON ClassRoomSeats.ClassRoomID = ExamArrangedSeats.ClassRoomID
        AND ClassRoomComponents.SeatID = ExamArrangedSeats.SeatID
    LEFT JOIN ExamStuStatus
        ON ExamStuStatus.EID = ExamArrangedSeats.EID
        AND ExamStuStatus.StudentID = ExamArrangedSeats.StudentID
    WHERE ClassRoomComponents.ClassRoomID = ?
";

// Check if SQL preparation is successful
if ($stmt1 = $conn1->prepare($sql)) {
    // Bind parameters and execute the query
    $stmt1->bind_param("i", $ClassRoomID);  // Ensure ClassRoomID is an integer
    $stmt1->execute();
    
    // Fetch the results
    $result1 = $stmt1->get_result();
    $data = [];
    
    if ($result1->num_rows > 0) {
        while ($row = $result1->fetch_assoc()) {
            $data[] = [
                'componentId' => intval($row['ComponentID']),
                'typeId' => intval($row['TypeID']),
                'x' => intval($row['x']),
                'y' => intval($row['y']),
                'RID' => intval($row['ClassRoomID']),
                'seatId' => (string)intval($row['SeatID']),
                'macAddress' => $row['MacAddress'],
                'status' => (string)$row['status'],
                'type' => $row['Type'],
                'studentId' => $row['StudentID'] ?? null,
                'studentName' => $row['StudentName'] ?? null
            ];
        }
    }

    // Return the data in JSON format
    echo json_encode($data);

    // Close the statement
    $stmt1->close();
} else {
    // Output SQL preparation error
    echo json_encode(["error" => "SQL preparation failed: " . $conn1->error]);
}

// Close the database connection
$conn1->close();
