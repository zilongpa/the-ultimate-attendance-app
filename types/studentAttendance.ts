import student from './student';

export interface studentAttendance {
    id: number;
    check_in_time: Date;
}
export default interface complexStudentAttendance {
    student: student;
    attendance: studentAttendance[];
    totalAttendance: number;
}