# Week Schema Feature - Setup Guide

The Week Schema feature allows users to create, save, and manage weekly workout plans. This guide explains how to set up the necessary database tables in Supabase.

## Database Schema

This feature requires two new tables:

1. `week_schemas` - Stores metadata about each week schema
2. `week_schema_workouts` - Junction table that links workouts to specific days in a schema

## Setup Instructions

### 1. Create Tables in Supabase

Run the SQL script in the Supabase SQL Editor to create the necessary tables:

1. Log in to your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `src/lib/sql/week_schemas.sql`
4. Run the SQL script

The script will:
- Create the required tables with proper relations
- Set up Row Level Security (RLS) policies
- Create a trigger to ensure only one active schema per user
- Add necessary indexes for performance

### 2. Test the Feature

Once the tables are created, you can:

1. Navigate to the "Week Schema" tab in the app
2. Create a new schema and add workouts to different days
3. Save the schema
4. Create multiple schemas and switch between them

## Data Structure

### Week Schema
- `id`: UUID - Primary key
- `user_id`: UUID - Foreign key to auth.users
- `name`: Text - Name of the schema
- `is_active`: Boolean - Whether this is the user's active schema
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Week Schema Workouts
- `id`: UUID - Primary key
- `week_schema_id`: UUID - Foreign key to week_schemas
- `workout_plan_id`: UUID - Foreign key to workout_plans
- `day_index`: Integer (0-6) - Day of the week (Monday=0, Sunday=6)
- `order_index`: Integer - Order of the workout on that day
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Backend Functions

The following functions are available in `src/lib/db.ts`:

- `getUserWeekSchemas(userId)` - Loads all schemas for a user
- `saveWeekSchema(userId, schema)` - Saves or updates a schema
- `deleteWeekSchema(userId, schemaId)` - Deletes a schema
- `setActiveWeekSchema(userId, schemaId)` - Sets a schema as active

## Future Enhancements

Possible enhancements for this feature:
- Drag-and-drop support for reordering workouts
- Copying a schema
- Exporting/importing schemas
- Visual customization of schemas
- Tracking workout completion for each day 