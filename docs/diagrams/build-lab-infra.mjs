import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Diagram } from "file:///C:/Users/Chau%20Nhon/.claude/skills/drawio-aws-architect/src/builder.mjs";
import {
  endpoint,
  frame,
  group,
  icon,
  onpremFrame,
  renderTree,
} from "file:///C:/Users/Chau%20Nhon/.claude/skills/drawio-aws-architect/src/layout-engine.mjs";

const outDir = dirname(fileURLToPath(import.meta.url));
const d = new Diagram("network");

const desk = onpremFrame("desk", "On laptop", [
  endpoint("dev", "Developer\nSSM / DBeaver tunnel"),
  icon("gha", "githubactions", "GitHub Actions\nOIDC (no access keys)"),
]);

const users = endpoint("browser", "Browser\nallowed CIDR → :80");

const managed = frame("managed", "Regional services (outside VPC)", { dir: "col", gap: 18 }, [
  icon("sess", "systems_manager_session_manager", "Session Manager"),
  icon("grole", "role", "GitHub OIDC role\nECR push · SSM"),
  icon("ecr", "ecr", "ECR\nelearning"),
  icon("ssm", "systems_manager", "SSM Run Command"),
  icon("ps", "parameter_store", "/elearning/lab/*"),
  icon("s3", "s3", "S3 media"),
  icon("bud", "budgets_2", "Budgets $20"),
]);

const host = group("sg", "group_security_group", "SG · inbound TCP 80 only · MySQL not published", { dir: "row", gap: 22 }, [
  icon("ec2", "ec2", "t4g.small\nAL2023 ARM"),
  icon("nginx", "nginx", "app\nNginx + PHP-FPM"),
  icon("mysql", "mysql", "mysql:8\nvolume on EBS"),
  icon("ebs", "elastic_block_store_volume_gp3", "EBS 30 GB gp3\nencrypted"),
  icon("erole", "role", "Instance role\nECR · SSM · S3"),
]);

const vpc = group("vpc", "group_vpc", "Default VPC", { dir: "col", gap: 18 }, [
  icon("igw", "internet_gateway", "Internet Gateway"),
  group("az", "group_availability_zone", "Single AZ · public IP (changes on start)", { dir: "col", gap: 16 }, [
    group("pub", "group_subnet", "Public subnet", { dir: "col", gap: 14 }, [host]),
  ]),
]);

const cloud = group("aws", "group_aws_cloud_alt", "AWS Cloud", { dir: "col", gap: 24 }, [
  group("region", "group_region", "Region ap-southeast-2 (Sydney)", { dir: "row", gap: 28, align: "top" }, [
    managed,
    vpc,
  ]),
]);

const tree = frame("root", "", { dir: "row", gap: 50, align: "center", header: 0, pad: 10, fill: "none", stroke: "none" }, [
  frame("left", "", { dir: "col", gap: 40, header: 0, fill: "none", stroke: "none" }, [desk, users]),
  cloud,
]);

renderTree(d, tree, [40, 70]);
d.title("Lab EC2 — current AWS footprint (single t4g.small, no ALB / NAT / RDS)");

d.link("browser", "igw", "HTTP :80", { flow: true });
d.link("igw", "ec2", "public IP");
d.link("ec2", "nginx", "localhost");
d.link("nginx", "mysql", "3306 docker net");
d.link("mysql", "ebs", "mysql_data");
d.link("gha", "grole", "OIDC");
d.link("grole", "ecr", "push");
d.link("gha", "ssm", "send-command");
d.link("ssm", "ec2", "deploy.sh", { flow: true });
d.link("ecr", "ec2", "pull arm64");
d.link("ps", "ec2", "fetch-env.sh");
d.link("ec2", "s3", "media");
d.link("dev", "sess", "start-session", { dash: true });

const res = d.validate();
console.log(JSON.stringify({ ok: res.ok, errors: res.errors, warnings: res.warnings, advice: res.audit?.advice }));
writeFileSync(join(outDir, "lab-aws-architecture.drawio"), d.mxfile("Lab AWS architecture"));
