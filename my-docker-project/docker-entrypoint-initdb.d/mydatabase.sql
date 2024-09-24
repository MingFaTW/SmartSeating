-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： mysql:3306
-- 產生時間： 2024 年 09 月 24 日 03:42
-- 伺服器版本： 5.7.44
-- PHP 版本： 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `mydatabase`
--

-- --------------------------------------------------------

--
-- 資料表結構 `Classes`
--

CREATE TABLE `Classes` (
  `CLID` int(5) NOT NULL COMMENT '班級ID',
  `name` varchar(20) NOT NULL COMMENT '班級名稱'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 傾印資料表的資料 `Classes`
--

INSERT INTO `Classes` (`CLID`, `name`) VALUES
(8, '	測試班級');

-- --------------------------------------------------------

--
-- 資料表結構 `ClassRoom`
--

CREATE TABLE `ClassRoom` (
  `ClassRoomID` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `SeatNum` int(11) NOT NULL,
  `disabledSeats` int(11) NOT NULL,
  `Width` int(11) NOT NULL,
  `Height` int(11) NOT NULL,
  `token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `ClassRoom`
--

INSERT INTO `ClassRoom` (`ClassRoomID`, `Name`, `SeatNum`, `disabledSeats`, `Width`, `Height`, `token`) VALUES
(903, '圖資大樓0903', 60, 0, 1200, 800, NULL),
(907, '圖資大樓0907', 60, 0, 1200, 800, NULL),
(1004, '圖資大樓1004', 60, 0, 1200, 800, NULL),
(1008, '圖資大樓1008', 60, 0, 1200, 800, NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `ClassRoomComponents`
--

CREATE TABLE `ClassRoomComponents` (
  `ComponentID` int(11) NOT NULL,
  `ClassRoomID` int(11) NOT NULL,
  `TypeID` int(11) NOT NULL,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  `SeatID` varchar(255) DEFAULT NULL,
  `MacAddress` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `ClassRoomComponents`
--

INSERT INTO `ClassRoomComponents` (`ComponentID`, `ClassRoomID`, `TypeID`, `x`, `y`, `SeatID`, `MacAddress`) VALUES
(1, 123, 1, 307, 217, '1', ''),
(2, 123, 1, 307, 317, '3', ''),
(3, 123, 1, 307, 267, '2', ''),
(4, 123, 2, 468, 218, '4', '1A-2B-3C-4D-5E-6F'),
(5, 123, 2, 468, 268, '5', '1A-2B-3C-4D-5E-6F'),
(6, 123, 4, 467, 368, '8', ''),
(7, 123, 2, 468, 318, '6', ''),
(8, 123, 4, 357, 368, '7', ''),
(9, 123, 5, 376, 107, '0', ''),
(10, 123, 3, 717, 278, '9', ''),
(11, 123, 3, 828, 278, '10', ''),
(12, 123, 4, 717, 329, '11', ''),
(13, 123, 4, 827, 329, '12', ''),
(14, 123, 6, 138, 116, '0', ''),
(15, 123, 6, 135, 375, '0', ''),
(16, 123, 7, 136, 268, '0', '');

-- --------------------------------------------------------

--
-- 資料表結構 `ClassRoomComponentType`
--

CREATE TABLE `ClassRoomComponentType` (
  `TypeID` int(11) NOT NULL,
  `Type` varchar(255) CHARACTER SET utf8mb4 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- 傾印資料表的資料 `ClassRoomComponentType`
--

INSERT INTO `ClassRoomComponentType` (`TypeID`, `Type`) VALUES
(1, 'leftSeat'),
(2, 'rightSeat'),
(3, 'frontSeat'),
(4, 'backSeat'),
(5, 'whiteBoard'),
(6, 'door'),
(7, 'window');

-- --------------------------------------------------------

--
-- 資料表結構 `ClassRoomSeats`
--

CREATE TABLE `ClassRoomSeats` (
  `ClassRoomID` int(11) NOT NULL,
  `SeatID` int(11) NOT NULL,
  `Status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `ClassRoomSeats`
--

INSERT INTO `ClassRoomSeats` (`ClassRoomID`, `SeatID`, `Status`) VALUES
(123, 1, '0'),
(123, 2, '0'),
(123, 3, '0'),
(123, 4, '0'),
(123, 5, '0'),
(123, 6, '0'),
(123, 7, '1'),
(123, 8, '1'),
(123, 9, '0'),
(123, 10, '0'),
(123, 11, '0'),
(123, 12, '0');

-- --------------------------------------------------------

--
-- 資料表結構 `ExamArrangedSeats`
--

CREATE TABLE `ExamArrangedSeats` (
  `EID` int(11) NOT NULL,
  `ClassRoomID` int(11) NOT NULL,
  `SeatID` int(11) NOT NULL,
  `COID` int(11) NOT NULL,
  `StudentID` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
  `StudentName` varchar(255) CHARACTER SET utf8mb4 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- 傾印資料表的資料 `ExamArrangedSeats`
--

INSERT INTO `ExamArrangedSeats` (`EID`, `ClassRoomID`, `SeatID`, `COID`, `StudentID`, `StudentName`) VALUES
(1, 123, 1, 1, 'CBB110004', '月夜'),
(1, 123, 2, 1, 'CBB110003', '張菲'),
(1, 123, 3, 1, 'CBB110002', '李大鳴'),
(1, 123, 4, 1, '', ''),
(1, 123, 5, 1, '', ''),
(1, 123, 6, 1, 'CBB110001', '王大華'),
(1, 123, 7, 1, '', ''),
(1, 123, 8, 1, 'CBB110213', '李明發'),
(1, 123, 9, 1, 'CBB110005', '張可涵'),
(1, 123, 10, 1, '', ''),
(1, 123, 11, 1, '', ''),
(1, 123, 12, 1, '', ''),
(1, 124, 1, 1, 'CBB110005', ''),
(219, 9000, 3, 21, 'stu04', ''),
(219, 9000, 4, 21, 'stu01', ''),
(219, 9001, 2, 21, 'stu02', ''),
(219, 9001, 4, 21, 'stu03', ''),
(219, 9002, 4, 21, 'stu05', '');

-- --------------------------------------------------------

--
-- 資料表結構 `ExamSeats`
--

CREATE TABLE `ExamSeats` (
  `SiteID` int(11) NOT NULL,
  `SeatID` int(11) NOT NULL,
  `MacAddress` varchar(64) CHARACTER SET ascii NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- 傾印資料表的資料 `ExamSeats`
--

INSERT INTO `ExamSeats` (`SiteID`, `SeatID`, `MacAddress`) VALUES
(9000, 1, '00:1A:2B:3C:4D:5E'),
(9000, 2, '00:1A:2B:3C:4D:5F'),
(9000, 3, '00:1A:2B:3C:4D:60'),
(9000, 4, '00:1A:2B:3C:4D:61'),
(9000, 5, '00:1A:2B:3C:4D:62'),
(9000, 6, '00:1A:2B:3C:4D:63'),
(9000, 7, '00:1A:2B:3C:4D:64'),
(9000, 8, '00:1A:2B:3C:4D:65'),
(9000, 9, '00:1A:2B:3C:4D:66'),
(9000, 10, '00:1A:2B:3C:4D:67'),
(9000, 11, '00:1A:2B:3C:4D:5F');

-- --------------------------------------------------------

--
-- 資料表結構 `ExamSites`
--

CREATE TABLE `ExamSites` (
  `SiteID` int(11) NOT NULL,
  `Name` varchar(64) CHARACTER SET utf8 NOT NULL,
  `Vacancies` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- 傾印資料表的資料 `ExamSites`
--

INSERT INTO `ExamSites` (`SiteID`, `Name`, `Vacancies`) VALUES
(9000, '測試考場', 5),
(9001, '測試考場2', 7),
(9002, '測試考場3', 4);

-- --------------------------------------------------------

--
-- 資料表結構 `ExamStatus`
--

CREATE TABLE `ExamStatus` (
  `EID` int(11) NOT NULL COMMENT '測驗ID',
  `isCorrecting` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否被伺服器自動批改過(0還沒，1已批改)'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='測驗的狀態，用來判斷系統是否有自動批改過此測驗';

--
-- 傾印資料表的資料 `ExamStatus`
--

INSERT INTO `ExamStatus` (`EID`, `isCorrecting`) VALUES
(108, 1),
(109, 1),
(110, 1),
(111, 1);

-- --------------------------------------------------------

--
-- 資料表結構 `ExamStuStatus`
--

CREATE TABLE `ExamStuStatus` (
  `EID` int(11) NOT NULL COMMENT '測驗ID',
  `StudentID` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '學生帳號名稱',
  `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL COMMENT '狀態(未開始、進行中、結束、缺考)'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='學生測驗的狀態(未開始、進行中、結束、缺考)';

--
-- 傾印資料表的資料 `ExamStuStatus`
--

INSERT INTO `ExamStuStatus` (`EID`, `StudentID`, `status`) VALUES
(1, 'CBB110001', '進行中'),
(1, 'CBB110002', '缺考'),
(1, 'CBB110003', '結束'),
(1, 'CBB110004', '未開始'),
(1, 'CBB110005', '進行中'),
(108, 'stu01', '缺考'),
(108, 'stu02', '缺考'),
(108, 'stu03', '缺考'),
(108, 'stu04', '缺考'),
(108, 'stu05', '缺考'),
(109, 'stu01', '缺考'),
(109, 'stu02', '缺考'),
(109, 'stu03', '缺考'),
(109, 'stu04', '缺考'),
(109, 'stu05', '缺考'),
(110, 'stu01', '結束'),
(110, 'stu02', '缺考'),
(110, 'stu03', '缺考'),
(110, 'stu04', '缺考'),
(110, 'stu05', '缺考'),
(110, 'tea01', '進行中'),
(111, 'stu01', '缺考'),
(111, 'stu02', '缺考'),
(111, 'stu03', '缺考'),
(111, 'stu04', '缺考'),
(111, 'stu05', '缺考');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `Classes`
--
ALTER TABLE `Classes`
  ADD PRIMARY KEY (`CLID`);

--
-- 資料表索引 `ClassRoom`
--
ALTER TABLE `ClassRoom`
  ADD PRIMARY KEY (`ClassRoomID`);

--
-- 資料表索引 `ClassRoomComponents`
--
ALTER TABLE `ClassRoomComponents`
  ADD PRIMARY KEY (`ComponentID`,`ClassRoomID`);

--
-- 資料表索引 `ClassRoomComponentType`
--
ALTER TABLE `ClassRoomComponentType`
  ADD PRIMARY KEY (`TypeID`);

--
-- 資料表索引 `ClassRoomSeats`
--
ALTER TABLE `ClassRoomSeats`
  ADD PRIMARY KEY (`ClassRoomID`,`SeatID`);

--
-- 資料表索引 `ExamArrangedSeats`
--
ALTER TABLE `ExamArrangedSeats`
  ADD PRIMARY KEY (`ClassRoomID`,`SeatID`);

--
-- 資料表索引 `ExamSites`
--
ALTER TABLE `ExamSites`
  ADD PRIMARY KEY (`SiteID`);

--
-- 資料表索引 `ExamStatus`
--
ALTER TABLE `ExamStatus`
  ADD PRIMARY KEY (`EID`);

--
-- 資料表索引 `ExamStuStatus`
--
ALTER TABLE `ExamStuStatus`
  ADD PRIMARY KEY (`EID`,`StudentID`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `Classes`
--
ALTER TABLE `Classes`
  MODIFY `CLID` int(5) NOT NULL AUTO_INCREMENT COMMENT '班級ID', AUTO_INCREMENT=9;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `ClassRoom`
--
ALTER TABLE `ClassRoom`
  MODIFY `ClassRoomID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1009;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
