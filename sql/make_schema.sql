--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3 (Ubuntu 12.3-1.pgdg20.04+1)
-- Dumped by pg_dump version 12.3 (Ubuntu 12.3-1.pgdg20.04+1)

-- Started on 2020-07-29 00:26:35 CEST

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

--
-- TOC entry 3 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 2977 (class 0 OID 0)
-- Dependencies: 3
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 203 (class 1259 OID 16415)
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
-- TOC entry 202 (class 1259 OID 16397)
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

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (slug);


ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (discord_id);


-- Completed on 2020-07-29 00:26:35 CEST

--
-- PostgreSQL database dump complete
--