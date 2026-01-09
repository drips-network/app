#!/bin/sh

deno task db:migrate && deno task start
