--
-- PostgreSQL database dump
--

\restrict LespGRsY3THP9qyHCbJOf9gsNnkuBh87FfVfsPf0ajMebvyks3iKbGtSFKvbOWu

-- Dumped from database version 14.20 (Ubuntu 14.20-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.20 (Ubuntu 14.20-0ubuntu0.22.04.1)

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
-- Name: BrewStatus; Type: TYPE; Schema: public; Owner: brew-master
--

CREATE TYPE public."BrewStatus" AS ENUM (
    'in_progress',
    'finished',
    'cancelled'
);


ALTER TYPE public."BrewStatus" OWNER TO "brew-master";

--
-- Name: TimeUnit; Type: TYPE; Schema: public; Owner: brew-master
--

CREATE TYPE public."TimeUnit" AS ENUM (
    'minutes',
    'days'
);


ALTER TYPE public."TimeUnit" OWNER TO "brew-master";

--
-- Name: UnitOfMeasure; Type: TYPE; Schema: public; Owner: brew-master
--

CREATE TYPE public."UnitOfMeasure" AS ENUM (
    'g',
    'l'
);


ALTER TYPE public."UnitOfMeasure" OWNER TO "brew-master";

--
-- Name: UsageMoment; Type: TYPE; Schema: public; Owner: brew-master
--

CREATE TYPE public."UsageMoment" AS ENUM (
    'boil',
    'mash',
    'hopstand',
    'whirlpool',
    'dry_hop'
);


ALTER TYPE public."UsageMoment" OWNER TO "brew-master";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: brew-master
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO "brew-master";

--
-- Name: brews; Type: TABLE; Schema: public; Owner: brew-master
--

CREATE TABLE public.brews (
    id text NOT NULL,
    user_id text NOT NULL,
    recipe_id text NOT NULL,
    batch_liters numeric(10,3) NOT NULL,
    status public."BrewStatus" DEFAULT 'in_progress'::public."BrewStatus" NOT NULL,
    brew_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    bottling_date timestamp(3) without time zone,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.brews OWNER TO "brew-master";

--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: brew-master
--

CREATE TABLE public.ingredients (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    stock numeric(10,3) DEFAULT 0 NOT NULL,
    reorder_threshold numeric(10,3) DEFAULT 0 NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    deleted_at timestamp(3) without time zone,
    is_in_stock boolean DEFAULT false NOT NULL,
    user_id text,
    unit_of_measure public."UnitOfMeasure" NOT NULL
);


ALTER TABLE public.ingredients OWNER TO "brew-master";

--
-- Name: login_attempts; Type: TABLE; Schema: public; Owner: brew-master
--

CREATE TABLE public.login_attempts (
    id text NOT NULL,
    user_id text,
    email text NOT NULL,
    ip text,
    "userAgent" text,
    "deviceId" text,
    success boolean NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.login_attempts OWNER TO "brew-master";

--
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: brew-master
--

CREATE TABLE public.recipe_ingredients (
    recipe_id text NOT NULL,
    ingredient_id text NOT NULL,
    quantity numeric(10,3) NOT NULL,
    "time" integer,
    "timeUnit" public."TimeUnit",
    usage_moment public."UsageMoment",
    id text NOT NULL
);


ALTER TABLE public.recipe_ingredients OWNER TO "brew-master";

--
-- Name: recipes; Type: TABLE; Schema: public; Owner: brew-master
--

CREATE TABLE public.recipes (
    id text NOT NULL,
    user_id text NOT NULL,
    style_id text,
    name text NOT NULL,
    batch_liters numeric(10,3) NOT NULL,
    ibu integer,
    color_srm integer,
    alcohol_percent numeric(4,2),
    details jsonb,
    deleted_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.recipes OWNER TO "brew-master";

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: brew-master
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revoked_at timestamp(3) without time zone,
    "userAgent" text,
    ip text
);


ALTER TABLE public.refresh_tokens OWNER TO "brew-master";

--
-- Name: styles; Type: TABLE; Schema: public; Owner: brew-master
--

CREATE TABLE public.styles (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    deleted_at timestamp(3) without time zone,
    user_id text
);


ALTER TABLE public.styles OWNER TO "brew-master";

--
-- Name: user_devices; Type: TABLE; Schema: public; Owner: brew-master
--

CREATE TABLE public.user_devices (
    id text NOT NULL,
    user_id text NOT NULL,
    "deviceId" text NOT NULL,
    "deviceName" text,
    ip text,
    last_seen timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.user_devices OWNER TO "brew-master";

--
-- Name: users; Type: TABLE; Schema: public; Owner: brew-master
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_email_verified boolean DEFAULT false NOT NULL,
    verification_token text,
    verification_token_expires timestamp(3) without time zone,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    last_login_at timestamp(3) without time zone,
    last_login_ip text,
    lock_until timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO "brew-master";

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: brew-master
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ac2ceb4b-22ae-45af-824a-dce3b52a3d04	1b1f2631a6c7e7c462f9d4995f8f29b19a294fc13251f8a923f8b5b4bbfcf357	2026-03-12 08:13:34.885288-03	20260206204413_make_usage_moment_optional	\N	\N	2026-03-12 08:13:34.818881-03	1
f8ee8e1f-5a82-4df9-bce8-1203594d0786	699a41d05361ac52ab3049c3b012b2647665b4380f02439b2beec4b1512fa4a3	2026-03-12 08:13:33.91003-03	20260114145052_init	\N	\N	2026-03-12 08:13:33.136747-03	1
29cf6dd8-5f12-4f73-a265-526f114f2b52	2636378cde1f20c6dd0a4df7d28ff2c7332aa0d4f127fdfd91071909762a5f16	2026-03-12 08:13:34.087571-03	20260120160434_make_styleid_optional_in_recipe	\N	\N	2026-03-12 08:13:33.921285-03	1
75cad010-0ffa-4732-88c7-df34c0faf21a	c9b0c32f2a7c959c43c1a461dc89d0b903b211478350c70e3190f060cd67eae1	2026-03-12 08:13:34.187566-03	20260120202436_remove_og_fg_from_recipe	\N	\N	2026-03-12 08:13:34.098604-03	1
7d0206e9-7d3b-4b9a-a04d-697785c167b7	5e549ace3f0b8a981323f0e4015970b77e779c139655ef2dadd3f0a49b3ab717	2026-03-12 08:13:34.962824-03	20260206205039_allow_duplicate_ingredients	\N	\N	2026-03-12 08:13:34.896445-03	1
e06f5b09-e3a0-4f64-9e9d-c853fb9c114e	b400639e23e191b624693a14fcb42aebb3f86fa4d6ce25f97732c0c76d9a924f	2026-03-12 08:13:34.297828-03	20260120203326_make_user_optional_in_recipe	\N	\N	2026-03-12 08:13:34.243634-03	1
8e312080-3446-4906-9de2-d85eac835e24	bcca8872ba0601ad5274b13adabf9e4fb6ea3f90e3ac0fb036c20841aa572573	2026-03-12 08:13:34.34205-03	20260127142116_make_userid_optional_in_brew	\N	\N	2026-03-12 08:13:34.309149-03	1
7086e497-7691-481f-a06f-7063749df4f2	b49fb8c73f16d7b1262fe23aac1dac3d6e259f57d29c889399775e64c0699c10	2026-03-12 08:13:34.386574-03	20260127142503_brew_userid_optional	\N	\N	2026-03-12 08:13:34.353117-03	1
79d5385c-20e6-46ca-9427-6710f151f668	98142959f9ec4a7dfdb6ab122e50989f2582c461622a224f9af3f447af8604f4	2026-03-12 08:13:35.207001-03	20260214174201_add_login_attempt_and_user_device	\N	\N	2026-03-12 08:13:34.974085-03	1
93e8e9ac-7b01-497c-8b0c-3f8c058ed041	8ec08dc8e98ce469ee1eb2b37b5b907aed0bfea5cfd41240262a8608cb4aed2a	2026-03-12 08:13:34.431159-03	20260127150000_add_deletedat_to_brew	\N	\N	2026-03-12 08:13:34.398441-03	1
f3b6e228-7388-4847-8c95-a11da2a70638	ecd4beacb314a82e77e22b8ca7e8b20fb60505b7ee35db21fc4c3c2a134f25de	2026-03-12 08:13:34.475029-03	20260128203558_add_isingredient_flag	\N	\N	2026-03-12 08:13:34.442349-03	1
4e63c34b-6734-4618-a548-ac0e33697c03	080f0336d0c325277d90786330433db25285c61d12916fd9f34c65a76f1247e7	2026-03-12 08:13:34.55282-03	20260129182639_allow_duplicate_style_name_if_deleted	\N	\N	2026-03-12 08:13:34.486466-03	1
7028a86d-fda4-4518-b12a-b02340851ab0	e03c8d5e48ee590d24268b9389ad2a5b539abee21178b421edbd6f60b614981d	2026-03-12 08:13:35.251267-03	20260214174710_add_email_verification_fields	\N	\N	2026-03-12 08:13:35.218388-03	1
674720f9-1308-4feb-bf73-9cd374758c58	2dd21a90d3858e22f699c1e1a914ae54aabce2504d21d8384b73f486734e8b9e	2026-03-12 08:13:34.630419-03	20260129183052_allow_duplicate_ingredient_name_if_deleted	\N	\N	2026-03-12 08:13:34.564214-03	1
5138df27-d29e-407e-84c1-c1183a57a789	a970ab7f5a5511a37beaa8d5e94d26db4e92a752e7700247b792eedf65dbecf3	2026-03-12 08:13:34.707953-03	20260129191946_allow_duplicate_ingredients_per_usage	\N	\N	2026-03-12 08:13:34.641679-03	1
9b86204c-074c-42bc-bb93-a69907acd3fc	1a0bf0869fbe75a1e67d8cd4171cdedb8e31e8e1cd91a9cbe0db8d028d2c47f9	2026-03-12 08:13:34.80773-03	20260205164259_add_usage_moment_enum_and_time_to_recipe_ingredient	\N	\N	2026-03-12 08:13:34.719179-03	1
0f3cb962-c5f6-40ea-a7b3-f546b5d1e480	ebbf5376646a81bf69cb02a4401adbcf7525f408ffd8fd8c5ae91acab0c10ca1	2026-03-12 08:13:35.295764-03	20260219130028_add_login_block_fields	\N	\N	2026-03-12 08:13:35.262479-03	1
c7647bff-7edd-4ef2-a1b3-5d25736aac8c	e32f8ad6d5d98472099e8a5ad351550d959c92d4669d3969f1a01d8791669314	2026-03-12 08:13:35.462156-03	20260219145909_refresh_token_and_userid_required	\N	\N	2026-03-12 08:13:35.307161-03	1
67d2ebb7-4f95-4ac5-a9a1-c207ba280ce8	c6f6800a32dea314faa9da2fa152ce397a21e5b912c4018d5d40aa5f2b2f67ac	2026-03-12 08:13:35.595402-03	20260310131339_add_user_relation_to_ingredient_and_style	\N	\N	2026-03-12 08:13:35.473353-03	1
\.


--
-- Data for Name: brews; Type: TABLE DATA; Schema: public; Owner: brew-master
--

COPY public.brews (id, user_id, recipe_id, batch_liters, status, brew_date, bottling_date, notes, created_at, updated_at, deleted_at) FROM stdin;
0f7feecd-9bc8-4c00-9a1f-0f2df4f48049	de75016c-5ed1-46d3-8dd2-438f33f5280f	0b2d0f0d-c321-4f81-a90d-dc81986db17d	20.000	cancelled	2026-03-17 19:46:30.868	\N	probando observaciones	2026-03-17 19:46:30.938	2026-03-17 19:46:46.692	2026-03-17 19:46:46.691
1b7378bb-304c-4525-bb55-d899a7e571d1	de75016c-5ed1-46d3-8dd2-438f33f5280f	0b2d0f0d-c321-4f81-a90d-dc81986db17d	20.000	finished	2026-03-17 19:46:52.682	2026-03-19 00:00:00	probando observaciones	2026-03-17 19:46:52.701	2026-03-17 19:46:59.52	\N
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: brew-master
--

COPY public.ingredients (id, name, type, stock, reorder_threshold, version, deleted_at, is_in_stock, user_id, unit_of_measure) FROM stdin;
2fcf3000-c798-4b96-8fb0-f183dd4fedcb	Levadura 2	yeast	222.000	22.000	1	\N	t	de75016c-5ed1-46d3-8dd2-438f33f5280f	g
ee16dd07-729a-4b7d-afbd-8ba13bf391fe	Lupulo 2	hop	150.000	5.000	1	\N	t	de75016c-5ed1-46d3-8dd2-438f33f5280f	g
0637feae-9dfa-461e-8770-891e5719e153	Levadura 1	yeast	210.500	22.000	1	\N	t	de75016c-5ed1-46d3-8dd2-438f33f5280f	g
21757a78-72ef-4696-8fd8-8ba520fef3ae	Lupulo 1	hop	100.000	10.000	1	\N	t	de75016c-5ed1-46d3-8dd2-438f33f5280f	g
ff6eb143-2d90-4962-8595-83cfd16d8e0c	Malta 2	malt	2300.000	500.000	1	\N	t	de75016c-5ed1-46d3-8dd2-438f33f5280f	g
f118a69c-a8ff-4605-b99a-678b3d2c478f	malta 12	malt	1200.000	100.000	1	\N	t	de75016c-5ed1-46d3-8dd2-438f33f5280f	g
\.


--
-- Data for Name: login_attempts; Type: TABLE DATA; Schema: public; Owner: brew-master
--

COPY public.login_attempts (id, user_id, email, ip, "userAgent", "deviceId", success, created_at) FROM stdin;
a140f894-901c-4e6f-907d-4f66a1d45510	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	t	2026-03-12 11:15:40.638
36ac47d8-eb36-41c9-8c8d-44babb3b4193	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	f	2026-03-12 11:19:00.497
3e100268-cc60-4d85-a66a-068cf3345505	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	t	2026-03-12 11:19:02.159
3c678f36-883b-4496-af2b-88da44432e69	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	f	2026-03-12 11:21:19.36
13aa2750-1127-4afb-900e-437d335cde8c	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	t	2026-03-12 11:21:25.926
8a805783-ca4e-422e-a3e3-bb1e2d52eb30	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	t	2026-03-17 19:07:46.33
2b48967e-1687-4287-817d-aec135df0d2e	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	t	2026-03-17 19:29:10.92
a62d4d2b-203e-49f9-a737-1473b09afb7c	de75016c-5ed1-46d3-8dd2-438f33f5280f	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	t	2026-03-17 19:31:07.982
7ca895c4-27c0-4890-99ff-2cd13ffb580a	de75016c-5ed1-46d3-8dd2-438f33f5280f	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	f	2026-03-17 19:41:13.97
94ba340a-c6f2-441a-b140-0c184af1f8d8	de75016c-5ed1-46d3-8dd2-438f33f5280f	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	f	2026-03-17 19:41:15.496
5c9835b7-c010-4de1-8476-5870fb92622b	de75016c-5ed1-46d3-8dd2-438f33f5280f	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	f	2026-03-17 19:41:16.46
58fbe4f2-31c7-42ac-85d3-62e13d232319	de75016c-5ed1-46d3-8dd2-438f33f5280f	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	f	2026-03-17 19:41:17.621
6d246891-8079-43e4-bea1-fff1945ceee0	de75016c-5ed1-46d3-8dd2-438f33f5280f	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	f	2026-03-17 19:41:19.062
9aeb9279-fd1e-4b24-965e-f37079d7dca3	de75016c-5ed1-46d3-8dd2-438f33f5280f	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	f	2026-03-17 19:41:43.503
24bf5571-ca48-4fdf-b740-84934436b0d6	de75016c-5ed1-46d3-8dd2-438f33f5280f	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	t	2026-03-17 19:41:45.253
dcd49877-5ff5-4988-868a-d1a88aee5f2b	de75016c-5ed1-46d3-8dd2-438f33f5280f	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	f	2026-03-26 18:37:23.85
4c90e69c-cc5a-491a-b058-a50d339974a4	de75016c-5ed1-46d3-8dd2-438f33f5280f	fredez1991@gmail.com	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	508c7e57-90ed-43d7-b295-3656e934c730	t	2026-03-26 18:37:28.133
\.


--
-- Data for Name: recipe_ingredients; Type: TABLE DATA; Schema: public; Owner: brew-master
--

COPY public.recipe_ingredients (recipe_id, ingredient_id, quantity, "time", "timeUnit", usage_moment, id) FROM stdin;
0b2d0f0d-c321-4f81-a90d-dc81986db17d	f118a69c-a8ff-4605-b99a-678b3d2c478f	1100.000	\N	\N	\N	c85fe8fc-00a5-440d-b0a5-34f72ce957c2
0b2d0f0d-c321-4f81-a90d-dc81986db17d	ff6eb143-2d90-4962-8595-83cfd16d8e0c	2100.000	\N	\N	\N	7b51908d-f80f-4d23-a8bf-3e873d134a87
0b2d0f0d-c321-4f81-a90d-dc81986db17d	21757a78-72ef-4696-8fd8-8ba520fef3ae	100.000	20	minutes	boil	4f21c15b-908f-4ac3-97c2-4d122e6985e8
0b2d0f0d-c321-4f81-a90d-dc81986db17d	ee16dd07-729a-4b7d-afbd-8ba13bf391fe	50.000	4	days	dry_hop	0a91705b-7891-4dbd-94ab-5978a5ee944c
0b2d0f0d-c321-4f81-a90d-dc81986db17d	0637feae-9dfa-461e-8770-891e5719e153	11.500	\N	\N	\N	85f22ae4-5052-4b4c-aeb1-7a14a875fec0
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: brew-master
--

COPY public.recipes (id, user_id, style_id, name, batch_liters, ibu, color_srm, alcohol_percent, details, deleted_at, created_at, updated_at) FROM stdin;
0b2d0f0d-c321-4f81-a90d-dc81986db17d	de75016c-5ed1-46d3-8dd2-438f33f5280f	86fdd4de-dbd5-47e1-8dae-fc2cf6a9a8f0	Receta 1	20.000	30	15	5.00	{"fg": 1010, "og": 1060, "notes": "probando observaciones", "mashWater": 22, "spargeWater": 10, "mashingTempC": 67, "boilTimeMinutes": 60, "fermentationDays": 7, "fermentationTempC": 22, "mashingTimeMinutes": 60}	\N	2026-03-17 19:42:23.874	2026-03-17 19:46:18.167
9301185b-9c7c-4067-aee5-c929762b62b9	de75016c-5ed1-46d3-8dd2-438f33f5280f	\N	Clonación Nueva Receta	20.000	0	0	0.00	{"fg": null, "og": null, "notes": "", "mashWater": null, "spargeWater": null, "mashingTempC": 0, "fermentationDays": 0, "fermentationTempC": 0, "mashingTimeMinutes": null}	2026-03-17 19:48:08.396	2026-03-17 19:44:05.268	2026-03-17 19:48:08.398
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: brew-master
--

COPY public.refresh_tokens (id, user_id, token_hash, expires_at, created_at, revoked_at, "userAgent", ip) FROM stdin;
f8dea30c-5ad5-4dca-a1e6-563599374aa2	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	$2b$10$iaEBYQ/Tt314OgwGorCKGe5xZmHLYRDrhl0sIT8B.HCsvOSmNcJte	2026-03-19 11:15:40.892	2026-03-12 11:15:40.893	2026-03-12 11:18:51.194	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1
0586a0b1-2b9c-4319-ad86-c2a4a0b74693	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	$2b$10$gbe4FQRolhFrkMKANeaU5OZGlj5eIVjjNe4nRu3jkSUHeUmeiny5e	2026-03-19 11:19:02.311	2026-03-12 11:19:02.312	2026-03-12 11:21:10.409	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1
e328a4d1-fe0e-4b73-a2ca-5e2d60d1b138	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	$2b$10$2s/oXVg0r7K3FylVudBem.3eJNlO4tIq6i5D64hd1YkQee9jPWZE2	2026-03-19 11:21:26.072	2026-03-12 11:21:26.073	2026-03-12 11:21:40.476	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1
19e0161d-45cb-4271-a85f-d78809aa25e9	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	$2b$10$TkcW.zZzodGSkUbQBqWkJ.Vl6EZwlpGREFX3KuxNeY6UrABLJzeAe	2026-03-24 19:07:46.515	2026-03-17 19:07:46.516	2026-03-17 19:13:03.383	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1
b30ef891-1c98-4ad1-935e-b24ffa81c180	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	$2b$10$QX7ZKlPyAKayDLnedURSR.bg/jE488Gv.jw9ZhtuqrBjK9E8uJ5zS	2026-03-24 19:29:11.041	2026-03-17 19:29:11.042	2026-03-17 19:30:13.471	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1
9e12bd06-84f4-41c3-bc4c-65c3f93d4765	de75016c-5ed1-46d3-8dd2-438f33f5280f	$2b$10$SsN3NjgA92NeuNfsvVLEyOvi3ddfgt.hkBt5xc6UojbBq/cc1C4B6	2026-03-24 19:31:08.138	2026-03-17 19:31:08.14	2026-03-17 19:34:14.075	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1
7353a20a-3f82-4a3d-b754-431bde5c3675	de75016c-5ed1-46d3-8dd2-438f33f5280f	$2b$10$mBTc96yFTgWE24mJtD8YYey8NoLgmYC/N3jIl3SX2jYXyGr2MChUy	2026-03-24 19:41:45.387	2026-03-17 19:41:45.389	2026-03-17 20:22:46.768	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1
15aeb718-a3dd-4482-bd14-7412ab27fce5	de75016c-5ed1-46d3-8dd2-438f33f5280f	$2b$10$702KZ.14jw7YlX7ZpnZPPeSqnnuY.coAIiA.wkpGPr4lF40VdIs82	2026-03-24 20:22:46.781	2026-03-17 20:22:46.783	2026-03-17 20:22:49.128	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	
580621cf-bd96-4658-b594-ddd3b11f1eb2	de75016c-5ed1-46d3-8dd2-438f33f5280f	$2b$10$Lq/qMrWoweEtqkZ3uopzT.r5ccpyhg2rFrKv3u/tMp/.KO3.3qjMS	2026-03-24 20:22:49.139	2026-03-17 20:22:49.141	2026-03-17 20:40:32.173	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1
58b5eb6f-cc03-4eb5-b721-deb3b91ff84e	de75016c-5ed1-46d3-8dd2-438f33f5280f	$2b$10$9cWO3kEx8R1Vb4OZkSzo/evbYrtHDkZjGDGtzjSdMKmaABobmMKmG	2026-03-24 20:40:32.197	2026-03-17 20:40:32.2	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1
\.


--
-- Data for Name: styles; Type: TABLE DATA; Schema: public; Owner: brew-master
--

COPY public.styles (id, name, description, deleted_at, user_id) FROM stdin;
86fdd4de-dbd5-47e1-8dae-fc2cf6a9a8f0	Ipa	\N	\N	de75016c-5ed1-46d3-8dd2-438f33f5280f
cbfa3cac-5889-436f-bf6f-d16a5b16ac82	Apa	\N	\N	de75016c-5ed1-46d3-8dd2-438f33f5280f
\.


--
-- Data for Name: user_devices; Type: TABLE DATA; Schema: public; Owner: brew-master
--

COPY public.user_devices (id, user_id, "deviceId", "deviceName", ip, last_seen, created_at, "isActive") FROM stdin;
2557a320-1489-4301-bc42-65031c69f265	d466d6da-f360-4fc9-9cbc-600c1fc75dd7	508c7e57-90ed-43d7-b295-3656e934c730	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1	2026-03-17 19:29:10.931	2026-03-12 11:15:40.699	t
cdf06e34-7990-40db-bd73-bd2899bf29c7	de75016c-5ed1-46d3-8dd2-438f33f5280f	508c7e57-90ed-43d7-b295-3656e934c730	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1	2026-03-26 18:37:28.142	2026-03-17 19:31:07.993	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: brew-master
--

COPY public.users (id, email, password_hash, created_at, is_email_verified, verification_token, verification_token_expires, failed_login_attempts, last_login_at, last_login_ip, lock_until) FROM stdin;
de75016c-5ed1-46d3-8dd2-438f33f5280f	fredez1991@gmail.com	$2b$12$vtZPo1.4LUz6okOZ1MkedO7viny7/xfB0iUDkyKOtU8SUXruDlVX6	2026-03-17 19:30:40.642	t	\N	\N	0	2026-03-26 18:37:28.098	::1	\N
d466d6da-f360-4fc9-9cbc-600c1fc75dd7	nuevo_email@dominio.com	$2b$12$kRspWCFB7Qqb50fiqjvQLOEganQwwm6YYS0oIjZD9GWS3JlkwpZ/2	2026-03-12 11:15:22.225	t	\N	\N	0	2026-03-17 19:29:10.901	::1	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: brews brews_pkey; Type: CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.brews
    ADD CONSTRAINT brews_pkey PRIMARY KEY (id);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: login_attempts login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (id);


--
-- Name: recipe_ingredients recipe_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: styles styles_pkey; Type: CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.styles
    ADD CONSTRAINT styles_pkey PRIMARY KEY (id);


--
-- Name: user_devices user_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ingredients_name_deleted_at_user_id_key; Type: INDEX; Schema: public; Owner: brew-master
--

CREATE UNIQUE INDEX ingredients_name_deleted_at_user_id_key ON public.ingredients USING btree (name, deleted_at, user_id);


--
-- Name: refresh_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: brew-master
--

CREATE INDEX refresh_tokens_user_id_idx ON public.refresh_tokens USING btree (user_id);


--
-- Name: styles_name_deleted_at_user_id_key; Type: INDEX; Schema: public; Owner: brew-master
--

CREATE UNIQUE INDEX styles_name_deleted_at_user_id_key ON public.styles USING btree (name, deleted_at, user_id);


--
-- Name: user_devices_user_id_deviceId_key; Type: INDEX; Schema: public; Owner: brew-master
--

CREATE UNIQUE INDEX "user_devices_user_id_deviceId_key" ON public.user_devices USING btree (user_id, "deviceId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: brew-master
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: brews brews_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.brews
    ADD CONSTRAINT brews_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: brews brews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.brews
    ADD CONSTRAINT brews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ingredients ingredients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: login_attempts login_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recipe_ingredients recipe_ingredients_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recipe_ingredients recipe_ingredients_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recipes recipes_style_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_style_id_fkey FOREIGN KEY (style_id) REFERENCES public.styles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recipes recipes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: styles styles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.styles
    ADD CONSTRAINT styles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_devices user_devices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brew-master
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TABLE _prisma_migrations; Type: ACL; Schema: public; Owner: brew-master
--

GRANT ALL ON TABLE public._prisma_migrations TO brewmasterdb;


--
-- Name: TABLE brews; Type: ACL; Schema: public; Owner: brew-master
--

GRANT ALL ON TABLE public.brews TO brewmasterdb;


--
-- Name: TABLE ingredients; Type: ACL; Schema: public; Owner: brew-master
--

GRANT ALL ON TABLE public.ingredients TO brewmasterdb;


--
-- Name: TABLE login_attempts; Type: ACL; Schema: public; Owner: brew-master
--

GRANT ALL ON TABLE public.login_attempts TO brewmasterdb;


--
-- Name: TABLE recipe_ingredients; Type: ACL; Schema: public; Owner: brew-master
--

GRANT ALL ON TABLE public.recipe_ingredients TO brewmasterdb;


--
-- Name: TABLE recipes; Type: ACL; Schema: public; Owner: brew-master
--

GRANT ALL ON TABLE public.recipes TO brewmasterdb;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: public; Owner: brew-master
--

GRANT ALL ON TABLE public.refresh_tokens TO brewmasterdb;


--
-- Name: TABLE styles; Type: ACL; Schema: public; Owner: brew-master
--

GRANT ALL ON TABLE public.styles TO brewmasterdb;


--
-- Name: TABLE user_devices; Type: ACL; Schema: public; Owner: brew-master
--

GRANT ALL ON TABLE public.user_devices TO brewmasterdb;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: brew-master
--

GRANT ALL ON TABLE public.users TO brewmasterdb;


--
-- PostgreSQL database dump complete
--

\unrestrict LespGRsY3THP9qyHCbJOf9gsNnkuBh87FfVfsPf0ajMebvyks3iKbGtSFKvbOWu

