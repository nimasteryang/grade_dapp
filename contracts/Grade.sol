pragma solidity ^0.5.0;

contract Grade{
    address public administrator;
    uint public studentCount = 0;
    mapping (uint => Student) public students;

    struct Student {
        uint id;
        address professor_addr;
        string student_name;
        uint release_time;
        string student_number;
        uint assignment_score;
        uint project_score;
        uint exam_score;
        string final_grade;
    }

    event StudentCreated(
        uint id,
        address professor_addr,
        string stdent_name,
        uint release_time,
        string student_number,
        uint assignment_score,
        uint project_score,
        uint exam_score,
        string final_grade
    );
    //administrator,which should be professor, or other grader
    constructor () public {
        administrator = msg.sender;
    }

    function createStudent(string memory student_name,string memory student_number,uint assignment_score,uint project_score,uint exam_score) public {
        //check if current user is administrator
        require(administrator == msg.sender);
        //increase id 
        studentCount++;
        address _professor_addr = msg.sender;
        
        uint final_score = assignment_score * 2/5 + project_score * 1/4 + exam_score * 7/20;
        string memory final_grade;
        if(final_score > 90){
            final_grade = "A+";
        }else if(final_score > 80){
            final_grade = "A";
        }else if(final_score > 75){
            final_grade = "B+";
        }else if(final_score > 70){
            final_grade = "B";
        }else if(final_score > 65){
            final_grade = "C+";
        }else if(final_score > 60){
            final_grade = "C";
        }else if(final_score > 50){
            final_grade = "D";
        }else{
            final_grade = "F";
        }
        students[studentCount] = Student(studentCount,_professor_addr,student_name,block.number,student_number,assignment_score,project_score,exam_score,final_grade);
        //trigger an event
        emit StudentCreated(studentCount,_professor_addr,student_name, block.number,student_number, assignment_score, project_score,exam_score,final_grade);

    }

}