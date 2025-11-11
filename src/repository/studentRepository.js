import {Student} from "../model/student.js";

const students = new Map();

export const addStudent = ({id, name, password}) => {
    if (students.has(+id)) {
        return false;
    }
    students.set(+id, new Student(+id, name, password));
    return true;
};
export const findStudent = (id) => students.get(id);

export const updateStudent = (id, {name, password}) => {
    const student = students.get(id);
    if (!student) {
        return null;
    }
    if (name !== undefined) student.name = name;
    if (password !== undefined) student.password = password;
    return student;
};

export const deleteStudent = (id) => {
    const student = students.get(id);
    if (!student) {
        return null;
    }
    students.delete(id);
    return student;
};

export const addScore = (id, {examName, score}) => {
    const student = students.get(id);
    if (!student) {
        return false;
    }
    student.scores[examName] = score;
    return true;
};

export const findByName = (name) => {
    const result = [];
    const lowerName = name.toLowerCase();
    for (const student of students.values()) {
        if (student.name.toLowerCase() === lowerName) {
            const {password, ...studentWithoutPassword} = student;
            result.push(studentWithoutPassword);
        }
    }
    return result;
};

export const countByNames = (names) => {
    if (!names) return 0;
    const namesArray = Array.isArray(names) ? names : [names];
    const lowerNames = namesArray.map(n => n.toLowerCase());

    let count = 0;
    for (const student of students.values()) {
        if (lowerNames.includes(student.name.toLowerCase())) {
            count++;
        }
    }
    return count;
};

export const findByMinScore = (examName, minScore) => {
    const result = [];
    for (const student of students.values()) {
        if (student.scores[examName] && student.scores[examName] >= minScore) {
            const {password, ...studentWithoutPassword} = student;
            result.push(studentWithoutPassword);
        }
    }
    return result;
};