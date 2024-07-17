import React from 'react';
import { Rect, Text, Group, Circle } from 'react-konva';

const leftPanel = ({handleDragStart}) => {
    return (
        <div>
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
    );
};

export default leftPanel;