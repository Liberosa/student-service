import * as repo from "../repository/studentRepository.js";

export const addStudent = async ({id, name, password}) => {
    if (await repo.findStudentById(id)) {
        return false;
    }
    await repo.createStudent({_id: id, name, password});
    return true;
}

export const findStudent = async id => {
    const student = await repo.findStudentById(id);
    if (student) {
        student.password = undefined;
    }
    return student;
};

export const deleteStudent = async id => {
    const student = await repo.deleteStudentById(id);
    if (student) {
        student.password = undefined;
    }
    return student;
}

export const updateStudent = async (id, data) => {
    const student = await repo.updateStudent(id, data);
    if (student) {
        student.scores = undefined;
    }
    return student;
}

export const addScore = async (id, exam, score) => {
    return repo.updateStudentScore(id, exam, score);

}

export const findByName = async (name) => {
    const students = await repo.findStudentByName(name);
    if (Array.isArray(students)) {
        students.forEach(student => {
            student.password = undefined;
        });
    }
    return students;
}

export const countByNames = async (names) => {
    return  repo.countStudentsByNames(names);

}

export const findByMinScore = async (exam, minScore) => {
    const students = await repo.findStudentsByMinScore(exam, minScore);
    if (Array.isArray(students)) {
        students.forEach(student => {
            student.password = undefined;
        })

    }
    return students;
}