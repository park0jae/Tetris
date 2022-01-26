'use strict';
import BLOCKS from "./blocks.js"


const playGround = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartBtn = document.querySelector(".game-text > button");
const GAME_ROWS = 20;
const GAME_COLS = 10;

// 점수
let score = 0;
// 떨어 지는 속도
let duration = 500;

let downInterval;

// 움직이는 블럭 임시 저장 
let tempMovingItem;

// 블럭에 대한 모양과 좌표 값

// 블럭 오브젝트 ( 방향 , 위 , 왼쪽 )
const movingItem = {
    type:"tree",
    direction:0,
    top:0,
    left:3,
};

// 초기 테트리스 게임 판 생성 

init();

function init(){
    // Object.entries : 객체 자체의 key , value 쌍의 배열을 반환함 
    tempMovingItem = { ...movingItem };
    for(let i = 0; i < 20; i++){
        prependNewLine();
    }
    generateNewBlock();
}

function prependNewLine(){
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for(let j=0; j<10; j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    playGround.prepend(li);
}

// 블럭 그리기
function renderBlocks(moveType=""){

    // tempMovingItem 내에 속성 값을 복사 
    const { type , direction , top , left } = tempMovingItem;
    // moving 의 클래스르 가지고 있는 블록 가져오기 
    const movingBlocks = document.querySelectorAll(".moving");
    // 모든 블록에 moving 이라는 클래스 제거 
    movingBlocks.forEach(moving=> {
        moving.classList.remove(type,"moving");
    })
    // BLOCKS 의 type = tree ,, etc  및 방향에 대하여 x 좌표 + left , y좌표 + top 설정 
    BLOCKS[type][direction].some(block => {
        const x = block[0] + left;
        const y = block[1] + top;
        // 테트리스 판내의 가장 작은 matrix 를  뽑아오는 부분 
        const target =  playGround.childNodes[y] ? playGround.childNodes[y].childNodes[0].childNodes[x] : null;
        // target이 범위를 벗어나거나 이용할 수 없는 블록이 아닌지 체크 
        const isAvailable = checkEmpty(target);
        if(isAvailable){
            // 이용 가능하면 class에 moving 추가
            target.classList.add(type, "moving");
        }else{
            // 이동에 따라 변경되었던 tmpmovingItem 값을 다시 초기화시키고 
            tempMovingItem = {...movingItem};
            if(moveType === 'retry'){
                clearInterval(downInterval);
                showGameoverText();
            }
            setTimeout(()=>{
                renderBlocks('retry');
                if(moveType === "top"){
                    seizeBlock();
                }
            },0);
            return true;
        }
    })
    // render 성공시  ( 마지막에 시즈 모드로 놓기 위해서 )
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}
function showGameoverText(){
    gameText.style.display = "flex";
}

// 블록이 바닥이나 가장 아래의 블록 위치까지 도달했을 때 멈춤과 동시에 쌓임 
function seizeBlock(){
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving =>{
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch();
    
}
// 줄 쌓일 때마다 삭제 하는 기능 
function checkMatch(){
    const childNodes = playGround.childNodes;
   
    childNodes.forEach(child => {
        let matched =true;
        console.log(child);
        child.children[0].childNodes.forEach(li => {
            if(!li.classList.contains("seized")){
                matched = false;
            }
        })
        if(matched){
            child.remove();
            prependNewLine();
            score++;
            scoreDisplay.innerHTML = score;
        }
    })
    generateNewBlock();
}

// 블록이 바닥에 쌓이고 나서 새로운 블록 생성 
function generateNewBlock(){
    clearInterval(downInterval);

    downInterval = setInterval(()=>{
        moveBlock('top',1);
    },duration);
    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random()*blockArray.length);
    
    movingItem.type = blockArray[randomIndex][0];
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = {... movingItem};
    renderBlocks();
}

// 타겟을 넘겨 받아 타겟의 여부 판별 및 시즈모드 판별 
function checkEmpty(target){
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true;
}

// 블럭 움직 (movetype = top,left  + amount (이동) )
function moveBlock(moveType,amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType); 
}

// direction change => 블록의 모양을 바꾸는 부분 
function changeDirection(){
    const direction = tempMovingItem.direction;
    direction === 3? tempMovingItem.direction = 0: tempMovingItem.direction +=1;
    renderBlocks();
}

function dropBlock(){
    clearInterval(downInterval);
    downInterval= setInterval(() => {
        moveBlock("top",1);
    },10);
}

//event handling ( kew down ) 방향키에 따른 moveBlock에 위치 및 이동량 전달 , 및 스페이스바를 이용한 블록의 모양 변경 기능  
document.addEventListener("keydown", e=>{
    switch(e.keyCode){
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top",1);
            break;
        case 90:
            changeDirection();
            break;
        case 32:
            dropBlock();
        default:
            break;
    }
})

restartBtn.addEventListener("click", ()=> {
    playGround.innerHTML = "";
    gameText.style.display = "none";
    init();
})