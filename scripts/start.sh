#! /usr/bin/env bash


firebase emulators:start --export-on-exit --import dump || echo 'Did you ran `npm install firebase-tools -g`?'