import * as repo from "../repository/studentRepository.js";

const createErrorResponse = (status, message, path) => {
    return {
        timestamp: new Date().toISOString(),
        status,
        error: status === 404 ? "Not Found" : "Error",
        message,
        path
    };
};

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
        res.status(404).json(
            createErrorResponse(404, `Student with id ${req.params.id} not found`, req.path)
        );
    }
}

export const updateStudent = (req, res) => {
    const student = repo.updateStudent(+req.params.id, req.body);
    if (student) {
        res.json(student);
    } else {
        res.status(404).json(
            createErrorResponse(404, `Student with id ${req.params.id} not found`, req.path)
        );
    }
}

export const deleteStudent = (req, res) => {
    const student = repo.deleteStudent(+req.params.id);
    if (student) {
        const {password, ...studentWithoutPassword} = student;
        res.json(studentWithoutPassword);
    } else {
        res.status(404).json(
            createErrorResponse(404, `Student with id ${req.params.id} not found`, req.path)
        );
    }
}

export const addScore = (req, res) => {
    const success = repo.addScore(+req.params.id, req.body);
    if (success) {
        res.status(204).send();
    } else {
        res.status(404).json(
            createErrorResponse(404, "student not found", req.path)
        );
    }
}

export const findByName = (req, res) => {
    const students = repo.findByName(req.params.name);
    res.json(students);
}

export const countByNames = (req, res) => {
    const count = repo.countByNames(req.query.names);
    res.json(count);
}

export const findByMinScore = (req, res) => {
    const students = repo.findByMinScore(req.params.exam, +req.params.minScore);
    res.json(students);
}