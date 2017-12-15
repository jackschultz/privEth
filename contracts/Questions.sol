pragma solidity ^0.4.0;
contract Questions {

    struct Question {
        address asker;
        string wording;
    }
    
    Question question;
    mapping(address => bool) public answers;

    /// __init__
    function Questions(string _wording) public {
        question.asker = msg.sender;
        question.wording = _wording;
    }

    function answerQuestion (bool _answer) public {
        answers[msg.sender] = _answer;
    }

    function getQuestion () {
    }

}
