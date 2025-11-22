import * as service from "../service/studentService.js";
import {scoreSchema, studentSchema, updateStudentSchema} from "../validation/studentValidator.js";

export const addStudent = async (req, res) => {
    const {error} = studentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({error: error.details[0].message});
    }
    try {
        const success = await service.addStudent(req.body);
        res.sendStatus(success ? 201 : 409);
    } catch (e) {
        res.sendStatus(500);
    }
}

export const findStudent = async (req, res) => {
    try {
        const student = await service.findStudent(+req.params.id);
        if (student) {
            res.json(student);
        } else {
            res.status(404).send();
        }
    } catch (e) {
        res.sendStatus(500);
    }
}

export const updateStudent = async (req, res) => {
    const {error} = updateStudentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({error: error.details[0].message});
    }
    try {
        const student = await service.updateStudent(+req.params.id, req.body);
        if (student) {
            res.json(student);
        } else {
            res.status(404).send();
        }
    } catch (e) {
        res.sendStatus(500);
    }
}

export const deleteStudent = async (req, res) => {
    try {
        const student = await service.deleteStudent(+req.params.id);
        if (student) {
            res.json(student);
        } else {
            res.status(404).send();
        }
    } catch (e) {
        res.sendStatus(500);
    }
}

export const addScore = async (req, res) => {
    const {error} = scoreSchema.validate(req.body);
    if (error) {
        return res.status(400).json({error: error.details[0].message});
    }
    try {
        const success = await service.addScore(+req.params.id, req.body.examName, +req.body.score);
        res.sendStatus(success ? 204 : 404);
    } catch (e) {
        res.sendStatus(500);
    }
}

export const findByName = async (req, res) => {
    try {
        const students = await service.findByName(req.params.name);
        res.json(students);
    } catch (e) {
        res.sendStatus(500);
    }
}

export const countByNames = async (req, res) => {
    try {
        const names = Array.isArray(req.query.names) ? req.query.names : [req.query.names];
        const count = await service.countByNames(names);
        res.json(count);
    } catch (e) {
        res.sendStatus(500);
    }
}

export const findByMinScore = async (req, res) => {
    try {
        const students = await service.findByMinScore(req.params.exam, +req.params.minScore);
        res.json(students);
    } catch (e) {
        res.sendStatus(500);
    }
}
