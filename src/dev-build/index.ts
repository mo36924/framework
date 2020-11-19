#!/usr/bin/env node
import { patchTypescript } from "./patchTypescript";
import ts from "./typescript";

patchTypescript(ts);
ts.tsc();
