-- Enable RLS
alter table workout_plans enable row level security;
alter table workout_exercises enable row level security;

-- Single policy for workout_plans that handles all operations
create policy "Enable all operations for users based on user_id"
on workout_plans
as permissive
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy for workout_exercises
-- First, create a function to check if a workout belongs to the current user
create or replace function public.workout_belongs_to_user(workout_plan_id uuid)
returns boolean as $$
  select exists (
    select 1
    from workout_plans
    where id = workout_plan_id
    and user_id = auth.uid()
  );
$$ language sql security definer;

-- Single policy for workout_exercises that handles all operations
create policy "Enable all operations for users own workout exercises"
on workout_exercises
as permissive
for all
to authenticated
using (workout_belongs_to_user(workout_plan_id))
with check (workout_belongs_to_user(workout_plan_id)); 