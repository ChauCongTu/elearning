import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Diagram } from "file:///C:/Users/Chau%20Nhon/.claude/skills/drawio-aws-architect/src/builder.mjs";
import {
  band,
  endpoint,
  frame,
  group,
  icon,
  renderTree,
  stage,
} from "file:///C:/Users/Chau%20Nhon/.claude/skills/drawio-aws-architect/src/layout-engine.mjs";

const outDir = dirname(fileURLToPath(import.meta.url));
const d = new Diagram("pipeline");

const src = stage("st-src", 0, "1 · Source", [
  icon("gh", "github", "GitHub\nmain / develop"),
]);
const ci = stage("st-ci", 1, "2 · Build native ARM", [
  icon("gha", "githubactions", "Actions\nubuntu-24.04-arm"),
  icon("oidc", "identity_and_access_management", "OIDC assume\nelearning-github-deploy"),
]);
const art = stage("st-art", 2, "3 · Artifact & command", [
  icon("ecr", "ecr", "ECR push\nlinux/arm64"),
  icon("ssmcmd", "systems_manager", "SSM Run Command\ndeploy.sh (if running)"),
]);
const host = stage("st-host", 3, "4 · Lab host", [
  icon("ec2", "ec2", "EC2 t4g.small\npull + recreate app"),
  icon("docker", "docker", "Compose\napp + mysql"),
  icon("ps", "parameter_store", "fetch-env.sh\n/elearning/lab/*"),
  icon("sess", "systems_manager_session_manager", "Session Manager\n(no SSH)"),
]);

const xcut = band("band", "Identity · budget", [
  icon("iam", "role", "Instance role\nECR pull · SSM · S3"),
  icon("bud", "budgets_2", "Budget\n$20 / month"),
]);

const cloud = group("aws", "group_aws_cloud_alt", "AWS Cloud · ap-southeast-2", { dir: "col", gap: 36 }, [
  frame("pipe", "", { dir: "row", gap: 44, align: "top", header: 0, fill: "none", stroke: "none" }, [
    art,
    host,
  ]),
  xcut,
]);

const tree = frame("root", "", { dir: "row", gap: 44, align: "center", header: 0, pad: 10, fill: "none", stroke: "none" }, [
  endpoint("dev", "DEVELOPER\n\npush / workflow_dispatch\n· SSM session"),
  frame("left", "", { dir: "col", gap: 28, header: 0, fill: "none", stroke: "none" }, [src, ci]),
  cloud,
  endpoint("browser", "BROWSER\n\nhttp://PublicIp\nSG TCP 80"),
]);

renderTree(d, tree, [40, 80]);
d.title("Lab EC2 — CI/CD deploy (GitHub Actions ARM → ECR → SSM → Compose)");

d.link("dev", "gh", "git push", { flow: true });
d.link("gh", "gha", "workflow", { flow: true });
d.link("gha", "oidc", "AssumeRoleWithWebIdentity");
d.link("gha", "ecr", "docker push", { flow: true });
d.link("gha", "ssmcmd", "send-command");
d.link("ssmcmd", "ec2", "deploy.sh", { flow: true });
d.link("ecr", "ec2", "docker pull");
d.link("ps", "ec2", ".env");
d.link("ec2", "docker", "compose up");
d.link("docker", "browser", ":80");
d.link("dev", "sess", "start-session", { dash: true });

const res = d.validate();
console.log(JSON.stringify({ ok: res.ok, errors: res.errors, warnings: res.warnings, advice: res.audit?.advice }));
writeFileSync(join(outDir, "lab-deploy-pipeline.drawio"), d.mxfile("Lab deploy pipeline"));
