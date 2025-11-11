import * as repo from "../repository/studentRepository.js";

export const addStudent = (req, res) => {
    const success = repo.addStudent(req.body);
    if (success) {
        res.status(204).send();
    } else {
        res.status(409).send();
    }
}

export const findStudent = (req, res) => {
    const student = repo.findStudent(+req.params.id);
    if (student) {
        const {password, ...studentWithoutPassword} = student;
        res.json(studentWithoutPassword);
    } else {
        res.status(404).send();
    }
}

export const updateStudent = (req, res) => {

}

export const deleteStudent = (req, res) => {

}

export const addScore = (req, res) => {

}

export const findByName = (req, res) => {

}

export const countByNames = (req, res) => {

}

export const findByMinScore = (req, res) => {

}