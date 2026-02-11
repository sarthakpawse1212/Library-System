# Library Management System

Secure Full-Stack Application (Node.js + React + TypeScript)

A complete Library Management System built as part of the Suntel Global Take-Home Assignment.
The project implements secure authentication, role-based access control, CRUD operations, and a modern frontend UI, following industry best practices.

# Overview

This application allows users to:

Authenticate securely using JWT

Access resources based on roles (Admin / User)

Manage books with full CRUD operations

Borrow and return books

Maintain secure user sessions with refresh token flow

Track actions using audit logging

The system is implemented using:

Node.js + Express + TypeScript (Backend)

React + TypeScript + TailwindCSS (Frontend)

# Tech Stack
# Backend

Node.js + Express

TypeScript

PostgreSQL

JWT (Access + Refresh Tokens)

BCrypt for password hashing

RBAC (Role-Based Access Control)

Express Validator

Jest + Supertest for testing

# Frontend

React (TypeScript)

TailwindCSS for styling

Framer Motion for UI animations

Context API for auth & role state

# Security Features

JWT-based authentication

Access Token (short-lived)

Refresh Token (rotated & stored securely)

Secure password hashing using BCrypt

Role-based authorization enforced at API level

Protected routes on both backend and frontend

Automatic token refresh for seamless user sessions

Meaningful validation and error handling

# User Roles
Role	Permissions
User	View books, borrow/return books
Admin	Add, update, delete books + all user permissions

# Core Features
Authentication

Register new users

Login with username & password

Secure logout

Token refresh flow for long sessions

Books Management

List all books (authenticated users)

Create books (admin only)

Update book details (admin only)

Delete books (admin only)

Borrow / Return books

Audit Logging (Bonus Feature)

Tracks important actions like:

User login/logout

Token refresh

Book creation, update, deletion

Book borrow/return actions


# Frontend Features

Login screen with error handling

Role-aware navigation (Admin vs User)

Book listing for all authenticated users

Admin-only book management UI

Borrow / Return actions

Clean, minimal UI using TailwindCSS

Smooth animations via Framer Motion

# Testing

Backend: Jest + Supertest

# Docker Support 

Dockerized PostgreSQL setup

Easy local setup using docker-compose

# Getting Started (Local Setup)
CHeck README.md Files in Both Folders -> frontend / backend

Backend runs on:
-> http://localhost:3000
Frontend runs on:
-> http://localhost:5173

# Default Test Accounts
Username	Password	Role
admin	admin123	Admin
user	user123	User
✅ Assignment Coverage

✔ JWT Authentication
✔ Role-Based Access Control
✔ Secure CRUD APIs
✔ Input Validation & Error Handling
✔ Frontend with Role-Based UI
✔ Refresh Token Flow (Bonus)
✔ Audit Logging (Bonus)
✔ Docker Support (Bonus)
✔ Tests Included

# Notes for Reviewers

The project follows clean architecture principles

Business logic is separated from controllers

Security and scalability were prioritized

Code is written in TypeScript for maintainability

Easily extendable for pagination, search, and analytics

# GitHub
The complete source code (backend + frontend) is available on GitHub and ready for review.
