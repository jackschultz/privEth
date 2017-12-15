pragma solidity ^0.4.0;
contract Questions {

  mapping(address => uint) public answers;
  string question;
  address asker;
  uint trues;
  uint falses;

  /// __init__
  function Questions(string _question) public {
    asker = msg.sender;
    question = _question;
  }

  function answerQuestion (bool _answer) public {
    if (answers[msg.sender] == 0 && _answer) { //haven't answered yet
      answers[msg.sender] = 1; //they vote true
      trues += 1;
    }
    else if (answers[msg.sender] == 0 && !_answer) {
      answers[msg.sender] = 2; //falsity
      falses += 1;
    }
    else if (answers[msg.sender] == 2 && _answer) { // false switching to true
      answers[msg.sender] = 1; //true
      trues += 1;
      falses -= 1;
    }
    else if (answers[msg.sender] == 1 && !_answer) { // true switching to false
      answers[msg.sender] = 2; //falsity
      trues -= 1;
      falses += 1;
    }
  }

  function getQuestion() public constant returns (string, uint, uint, uint) {
    return (question, trues, falses, answers[msg.sender]);
  }

}
