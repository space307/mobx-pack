import React from 'react';

const Timer = ({ time }) => (
  <div>
    <strong>Time:</strong> {new Date(time).toTimeString()}
  </div>
);


export default Timer;

