-- Run this in the Supabase SQL Editor after 001_initial.sql

alter table public.profiles
  add column if not exists regenerations_count integer default 0,
  add column if not exists regenerations_reset_date date default current_date;
