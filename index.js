const express = require("express");

const server = express();

server.use(express.json());

let counter = 0;
const projects = [{ id: "1", title: "Novo projeto", tasks: [] }];

server.use((req, res, next) => {
  counter++;

  console.log(`The request was called ${counter} times`);

  next();
});

function checkUserExists(req, res, next) {
  if (!req.body.name) {
    return res.status(400).json({ error: "User name is required" });
  }
  return next();
}

function checkProjectIdExists(req, res, next) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: `project id is required` });
  }

  return next();
}

function checkProjectTitleExists(req, res, next) {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: `project title is required` });
  }

  return next();
}

function checkProjectInArray(req, res, next) {
  const [project] = projects.filter(x => x.id === req.params.id);

  if (!project) {
    return res.status(400).json({ error: `Project does not exists` });
  }

  const projectIndex = projects.findIndex(x => x.id === project.id);

  req.project = project;
  req.projectIndex = projectIndex;

  return next();
}

function checkProjectCreated(req, res, next) {
  const [project] = projects.filter(x => x.id === req.body.id);

  if (project) {
    return res
      .status(400)
      .json({ error: `Project with id ${project.id} already exists` });
  }

  return next();
}

server.get("/projects", (req, res) => {
  return res.json(projects);
});

server.get("/projects/:id", checkProjectInArray, (req, res) => {
  const project = req.project;
  return res.json(project);
});

server.post(
  "/projects",
  checkProjectCreated,
  checkProjectIdExists,
  checkProjectTitleExists,
  (req, res) => {
    const { id, title } = req.body;
    const project = {
      id,
      title,
      tasks: []
    };
    projects.push(project);

    return res.json(project);
  }
);

server.post(
  "/projects/:id/tasks",
  checkProjectInArray,
  checkProjectTitleExists,
  (req, res) => {
    const { title } = req.body;
    let project = req.project;

    project.tasks.push(title);

    return res.json(project);
  }
);

server.put(
  "/projects/:id",
  checkProjectInArray,
  checkProjectTitleExists,
  (req, res) => {
    const { title } = req.body;
    let project = req.project;

    project.title = title;

    return res.json(project);
  }
);

server.delete("/projects/:id", checkProjectInArray, (req, res) => {
  const projectIndex = req.projectIndex;

  projects.splice(projectIndex, 1);

  return res.send();
});

server.listen(3333);
