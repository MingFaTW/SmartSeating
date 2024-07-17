import React from 'react';
import { Rect, Text, Group, Circle } from 'react-konva';

const backSeat = ({ id, x, y, seatId, studentName, studentId, macAddress, status, onDragEnd, onDblClick }) => {
  return (
    <Group
        id={id}
        x={x}
        y={y}
        draggable
        onDragEnd={onDragEnd}
        onDblClick={onDblClick}
    >
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
        text={seatId}
        fontSize={12}
        fill="black"
        x={48}
        y={70}
        onDblClick={onDblClick}
    />
    <Text
        text={studentName}
        fontSize={12}
        fill="black"
        x={33}
        y={5}
    />
    <Text
        text={studentId}
        fontSize={12}
        fill="black"
        x={25}
        y={20}
    />
    <Text
        text={macAddress}
        fontSize={12}
        fill="black"
        x={0}
        y={30}
    />
    </Group>
  );
};

export default backSeat;
