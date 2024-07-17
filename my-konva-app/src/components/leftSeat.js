import React from 'react';
import { Rect, Text, Group, Circle } from 'react-konva';

const leftSeat = ({ id, x, y, seatId, studentName, studentId, macAddress, status, onDragEnd, onDblClick }) => {
  return (
    <Group
        id={id}
        x={x}
        y={y}
        draggable
        onDragEnd={onDragEnd}
        onDblClick={onDblClick}
    >
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
        text={seatId}
        fontSize={12}
        fill="black"
        x={18}
        y={20}
        onDblClick={onDblClick}
    />
    <Text
        text={studentName}
        fontSize={12}
        fill="black"
        x={80}
        y={10}
    />
    <Text
        text={studentId}
        fontSize={12}
        fill="black"
        x={75}
        y={25}
    />
    <Text
        text={macAddress}
        fontSize={12}
        fill="black"
        x={50}
        y={35}
    />
    </Group>
  );
};

export default leftSeat;
