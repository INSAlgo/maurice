--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3 (Debian 12.3-1.pgdg100+1)
-- Dumped by pg_dump version 12.3 (Debian 12.3-1.pgdg100+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: challenges; Type: TABLE; Schema: public; Owner: maurice
--

CREATE TABLE public.challenges (
    slug text NOT NULL,
    difficulty text NOT NULL,
    category text NOT NULL,
    multiplier double precision DEFAULT 1 NOT NULL
);


ALTER TABLE public.challenges OWNER TO maurice;

--
-- Name: users; Type: TABLE; Schema: public; Owner: maurice
--

CREATE TABLE public.users (
    discord_id text NOT NULL,
    hr_username text NOT NULL,
    score bigint DEFAULT 0 NOT NULL,
    last_challenge_slug text,
    total_resolved integer DEFAULT 0 NOT NULL,
    total_unknown_resolved integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.users OWNER TO maurice;

--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: maurice
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (slug);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: maurice
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (discord_id);


--
-- PostgreSQL database dump complete
--
