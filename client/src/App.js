import React, { useState } from 'react';

function TrackButton() {
  // 文字列を表示するための state を定義します
  const [showText, setShowText] = useState(false);

  return (
    <div>
      {/* ボタンをクリックすると showText ステートを true に設定します */}
      <button id="track-button" onClick={() => setShowText(true)}>
        ボタンを押してください
      </button>
      
      {/* showText が true の場合にのみテキストを表示します */}
      {showText && <div id="track-text">hello track</div>}
    </div>
  );
}

export default TrackButton;

