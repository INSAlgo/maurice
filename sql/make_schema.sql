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


ALTER TABLE public.users OWNER TO maurice;

--
-- TOC entry 2971 (class 0 OID 16415)
-- Dependencies: 203
-- Data for Name: challenges; Type: TABLE DATA; Schema: public; Owner: maurice
--

COPY public.challenges (slug, difficulty, category, multiplier) FROM stdin;
solve-me-first	easy	warmup	1
simple-array-sum	easy	warmup	1
compare-the-triplets	easy	warmup	1
a-very-big-sum	easy	warmup	1
diagonal-difference	easy	warmup	1
plus-minus	easy	warmup	1
staircase	easy	warmup	1
mini-max-sum	easy	warmup	1
birthday-cake-candles	easy	warmup	1
time-conversion	easy	warmup	1
grading	easy	implementation	1
apple-and-orange	easy	implementation	1
kangaroo	easy	implementation	1
between-two-sets	easy	implementation	1
breaking-best-and-worst-records	easy	implementation	1
the-birthday-bar	easy	implementation	1
divisible-sum-pairs	easy	implementation	1
migratory-birds	easy	implementation	1
day-of-the-programmer	easy	implementation	1
bon-appetit	easy	implementation	1
sock-merchant	easy	implementation	1
drawing-book	easy	implementation	1
counting-valleys	easy	implementation	1
electronics-shop	easy	implementation	1
cats-and-a-mouse	easy	implementation	1
magic-square-forming	medium	implementation	1
picking-numbers	easy	implementation	1
climbing-the-leaderboard	medium	implementation	1
the-hurdle-race	easy	implementation	1
designer-pdf-viewer	easy	implementation	1
utopian-tree	easy	implementation	1
angry-professor	easy	implementation	1
beautiful-days-at-the-movies	easy	implementation	1
strange-advertising	easy	implementation	1
save-the-prisoner	easy	implementation	1
circular-array-rotation	easy	implementation	1
permutation-equation	easy	implementation	1
jumping-on-the-clouds-revisited	easy	implementation	1
find-digits	easy	implementation	1
extra-long-factorials	medium	implementation	1
append-and-delete	easy	implementation	1
sherlock-and-squares	easy	implementation	1
library-fine	easy	implementation	1
cut-the-sticks	easy	implementation	1
non-divisible-subset	medium	implementation	1
repeated-string	easy	implementation	1
jumping-on-the-clouds	easy	implementation	1
equality-in-a-array	easy	implementation	1
queens-attack-2	medium	implementation	1
acm-icpc-team	easy	implementation	1
taum-and-bday	easy	implementation	1
organizing-containers-of-balls	medium	implementation	1
encryption	medium	implementation	1
bigger-is-greater	medium	implementation	1
kaprekar-numbers	easy	implementation	1
beautiful-triplets	easy	implementation	1
minimum-distances	easy	implementation	1
halloween-sale	easy	implementation	1
the-time-in-words	medium	implementation	1
chocolate-feast	easy	implementation	1
service-lane	easy	implementation	1
lisa-workbook	easy	implementation	1
flatland-space-stations	easy	implementation	1
fair-rations	easy	implementation	1
cavity-map	easy	implementation	1
manasa-and-stones	easy	implementation	1
the-grid-search	medium	implementation	1
happy-ladybugs	easy	implementation	1
strange-code	easy	implementation	1
3d-surface-area	medium	implementation	1
absolute-permutation	medium	implementation	1
bomber-man	medium	implementation	1
two-pluses	medium	implementation	1
larrys-array	medium	implementation	1
almost-sorted	medium	implementation	1
matrix-rotation-algo	hard	implementation	1
big-sorting	easy	sorting	1
tutorial-intro	easy	sorting	1
insertionsort1	easy	sorting	1
insertionsort2	easy	sorting	1
correctness-invariant	easy	sorting	1
runningtime	easy	sorting	1
quicksort1	easy	sorting	1
countingsort1	easy	sorting	1
countingsort2	easy	sorting	1
countingsort4	medium	sorting	1
closest-numbers	easy	sorting	1
find-the-median	easy	sorting	1
insertion-sort	advanced	sorting	1
fraudulent-activity-notifications	medium	sorting	1
camelcase	easy	strings	10
lilys-homework	medium	sorting	1
hackerland-radio-transmitters	medium	search	1
gridland-metro	medium	search	1
icecream-parlor	easy	search	1
knightl-on-chessboard	medium	search	1
minimum-loss	medium	search	1
missing-numbers	easy	search	1
pairs	medium	search	1
sherlock-and-array	easy	search	1
maximum-subarray-sum	hard	search	1
connected-cell-in-a-grid	medium	search	1
short-palindrome	medium	search	1
maximizing-mission-points	hard	search	1
count-luck	medium	search	1
cut-the-tree	medium	search	1
making-candies	hard	search	1
gena	medium	search	1
xor-quadruples	medium	search	1
red-knights-shortest-path	medium	search	1
bike-racers	hard	search	1
task-scheduling	advanced	search	1
similarpair	advanced	search	1
playing-with-numbers	hard	search	1
almost-integer-rock-garden	expert	search	1
sorted-subsegments	hard	search	1
distant-pairs	expert	search	1
king-richards-knights	hard	search	1
frog-in-maze	hard	graph theory	1
torque-and-development	medium	graph theory	1
journey-to-the-moon	medium	graph theory	1
synchronous-shopping	medium	graph theory	1
subset-component	hard	graph theory	1
kruskalmstrsub	medium	graph theory	1
even-tree	medium	graph theory	1
the-quickest-way-up	medium	graph theory	1
dijkstrashortreach	hard	graph theory	1
the-story-of-a-tree	medium	graph theory	1
primsmstsub	medium	graph theory	1
toll-cost-digits	hard	graph theory	1
real-estate-broker	hard	graph theory	1
clique	medium	graph theory	1
beautiful-path	medium	graph theory	1
borrowing-money	hard	graph theory	1
value-of-friendship	hard	graph theory	1
coprime-paths	expert	graph theory	1
minimum-mst-graph	expert	graph theory	1
jack-goes-to-rapture	medium	graph theory	1
crab-graphs	medium	graph theory	1
beadornaments	advanced	graph theory	1
jeanies-route	medium	graph theory	1
floyd-city-of-blinding-lights	hard	graph theory	1
johnland	medium	graph theory	1
kingdom-connectivity	hard	graph theory	1
computer-game	hard	graph theory	1
rust-murderer	medium	graph theory	1
problem-solving	hard	graph theory	1
journey-scheduling	hard	graph theory	1
matrix	hard	graph theory	1
episode-recording	hard	graph theory	1
repair-roads	hard	graph theory	1
kth-ancestor	hard	graph theory	1
bytelandian-tours	hard	graph theory	1
shortest-path	hard	graph theory	1
savita-and-friends	hard	graph theory	1
liars	advanced	graph theory	1
jumping-rooks	advanced	graph theory	1
tripartite-matching	hard	graph theory	1
tree-flow	hard	graph theory	1
dag-queries	expert	graph theory	1
favourite-sequence	advanced	graph theory	1
cat-jogging	advanced	graph theory	1
quadrant-queries	advanced	graph theory	1
hacker-country	hard	graph theory	1
missile-defend	hard	graph theory	1
huarongdao	expert	graph theory	1
training-the-army	hard	graph theory	1
jim-and-his-lan-party	hard	graph theory	1
travel-in-hackerland	hard	graph theory	1
alex-vs-fedor	expert	graph theory	1
vertical-paths	expert	graph theory	1
drive	expert	graph theory	1
game-of-thrones	easy	strings	10
tsp-grid	expert	graph theory	1
road-network	expert	graph theory	1
going-office	expert	graph theory	1
tree-splitting	advanced	graph theory	1
ticket	expert	graph theory	1
dfs-edges	expert	graph theory	1
diameter-minimization	expert	graph theory	1
airports	expert	graph theory	1
definite-random-walks	expert	graph theory	1
minimum-absolute-difference-in-an-array	easy	greedy	1
marcs-cakewalk	easy	greedy	1
grid-challenge	easy	greedy	1
luck-balance	easy	greedy	1
maximum-perimeter-triangle	easy	greedy	1
beautiful-pairs	easy	greedy	1
candies	medium	greedy	1
sherlock-and-the-beast	easy	greedy	1
priyanka-and-toys	easy	greedy	1
largest-permutation	easy	greedy	1
mark-and-toys	easy	greedy	1
greedy-florist	medium	greedy	1
angry-children	medium	greedy	1
jim-and-the-orders	easy	greedy	1
two-arrays	easy	greedy	1
board-cutting	hard	greedy	1
reverse-shuffle-merge	advanced	greedy	1
pylons	medium	greedy	1
cloudy-day	medium	greedy	1
chief-hopper	hard	greedy	1
sherlock-and-minimax	hard	greedy	1
accessory-collection	hard	greedy	1
team-formation	advanced	greedy	1
fighting-pits	hard	greedy	1
lena-sort	medium	constructive algorithms	1
coin-change	medium	dynamic programming	1
equal	medium	dynamic programming	1
flipping-the-matrix	medium	constructive algorithms	1
sherlock-and-cost	medium	dynamic programming	1
an-interesting-game-1	medium	constructive algorithms	1
new-year-chaos	medium	constructive algorithms	1
construct-the-array	medium	dynamic programming	1
bonetrousle	medium	constructive algorithms	1
kingdom-division	medium	dynamic programming	1
kmp-problem	hard	constructive algorithms	1
sam-and-substrings	medium	dynamic programming	1
beautiful-3-set	hard	constructive algorithms	1
fibonacci-modified	medium	dynamic programming	1
inverse-rmq	hard	constructive algorithms	1
abbr	medium	dynamic programming	1
two-subarrays	expert	constructive algorithms	1
prime-xor	medium	dynamic programming	1
lovely-triplets	advanced	constructive algorithms	1
array-construction	advanced	constructive algorithms	1
decibinary-numbers	hard	dynamic programming	1
fair-cut	medium	dynamic programming	1
maxsubarray	medium	dynamic programming	1
angry-children-2	hard	dynamic programming	1
sherlocks-array-merging-algorithm	hard	dynamic programming	1
prime-digit-sums	medium	dynamic programming	1
hr-city	medium	dynamic programming	1
summing-pieces	medium	dynamic programming	1
mr-k-marsh	medium	dynamic programming	1
substring-diff	medium	dynamic programming	1
xor-and-sum	medium	dynamic programming	1
lego-blocks	medium	dynamic programming	1
brick-tiling	hard	dynamic programming	1
alien-languages	hard	dynamic programming	1
stockmax	medium	dynamic programming	1
two-robots	medium	dynamic programming	1
cuttree	medium	dynamic programming	1
taras-beautiful-permutations	hard	dynamic programming	1
wet-shark-and-two-subsequences	medium	dynamic programming	1
array-splitting	medium	dynamic programming	1
choosing-white-balls	hard	dynamic programming	1
mandragora	medium	dynamic programming	1
red-john-is-back	medium	dynamic programming	1
tutzki-and-lcs	medium	dynamic programming	1
grid-walking	medium	dynamic programming	1
matrix-land	hard	dynamic programming	1
unbounded-knapsack	medium	dynamic programming	1
play-game	medium	dynamic programming	1
longest-increasing-subsequent	advanced	dynamic programming	1
coin-on-the-table	medium	dynamic programming	1
dynamic-programming-classics-the-longest-common-subsequence	medium	dynamic programming	1
strplay	medium	dynamic programming	1
black-n-white-tree-1	hard	dynamic programming	1
counting-special-sub-cubes	medium	dynamic programming	1
interval-selection	medium	dynamic programming	1
string-reduction	hard	dynamic programming	1
far-vertices	hard	dynamic programming	1
counting-road-networks	expert	dynamic programming	1
superman-celebrates-diwali	hard	dynamic programming	1
hexagonal-grid	hard	dynamic programming	1
queens-on-board	hard	dynamic programming	1
shashank-and-palindromic-strings	advanced	dynamic programming	1
points-in-a-plane	advanced	dynamic programming	1
turn-off-the-lights	hard	dynamic programming	1
animal-transport	hard	dynamic programming	1
the-indian-job	medium	dynamic programming	1
requirement	advanced	dynamic programming	1
a-super-hero	hard	dynamic programming	1
clues-on-a-binary-path	hard	dynamic programming	1
road-maintenance	hard	dynamic programming	1
billboards	advanced	dynamic programming	1
beautiful-string	hard	dynamic programming	1
covering-the-stains	hard	dynamic programming	1
gcd-matrix	hard	dynamic programming	1
fairy-chess	advanced	dynamic programming	1
suffix-rotation	expert	dynamic programming	1
newyear-present	hard	dynamic programming	1
travel-around-the-world	medium	dynamic programming	1
longest-palindromic-subsequence	hard	dynamic programming	1
candles-2	medium	dynamic programming	1
hyper-strings	advanced	dynamic programming	1
swappermutation	medium	dynamic programming	1
extremum-permutations	medium	dynamic programming	1
square-subsequences	hard	dynamic programming	1
dorsey-thief	advanced	dynamic programming	1
mining	advanced	dynamic programming	1
police-operation	hard	dynamic programming	1
zurikela	hard	dynamic programming	1
modify-the-sequence	advanced	dynamic programming	1
longest-mod-path	hard	dynamic programming	1
p-sequences	hard	dynamic programming	1
robot	advanced	dynamic programming	1
lucky-numbers	expert	dynamic programming	1
unfair-game	advanced	dynamic programming	1
oil-well	hard	dynamic programming	1
find-the-seed	advanced	dynamic programming	1
the-blacklist	advanced	dynamic programming	1
tree-pruning	advanced	dynamic programming	1
ones-and-twos	hard	dynamic programming	1
count-scorecards	expert	dynamic programming	1
vim-war	advanced	dynamic programming	1
best-spot	advanced	dynamic programming	1
divisible-numbers	expert	dynamic programming	1
unique-divide-and-conquer	advanced	dynamic programming	1
happy-king	expert	dynamic programming	1
dortmund-dilemma	advanced	dynamic programming	1
super-kth-lis	advanced	dynamic programming	1
count-ways-1	expert	dynamic programming	1
hard-drive-disks	expert	dynamic programming	1
separate-the-chocolate	expert	dynamic programming	1
lonely-integer	easy	bit manipulation	1
maximizing-xor	easy	bit manipulation	1
counter-game	medium	bit manipulation	1
xor-se	medium	bit manipulation	1
sum-vs-xor	easy	bit manipulation	1
the-great-xor	medium	bit manipulation	1
flipping-bits	easy	bit manipulation	1
yet-another-minimax-problem	medium	bit manipulation	1
sansa-and-xor	medium	bit manipulation	1
and-product	medium	bit manipulation	1
winning-lottery-ticket	medium	bit manipulation	1
xoring-ninja	hard	bit manipulation	1
cipher	medium	bit manipulation	1
xor-matrix	hard	bit manipulation	1
whats-next	medium	bit manipulation	1
string-transmission	hard	bit manipulation	1
aorb	medium	bit manipulation	1
manipulative-numbers	hard	bit manipulation	1
stonegame	hard	bit manipulation	1
2s-complement	advanced	bit manipulation	1
changing-bits	advanced	bit manipulation	1
xor-key	advanced	bit manipulation	1
maximizing-the-function	hard	bit manipulation	1
xor-subsequence	advanced	bit manipulation	1
iterate-it	expert	bit manipulation	1
hamming-distance	expert	bit manipulation	1
pmix	hard	bit manipulation	1
the-power-sum	medium	recursion	1
crossword-puzzle	medium	recursion	1
recursive-digit-sum	medium	recursion	1
simplified-chess-engine	medium	recursion	1
password-cracker	medium	recursion	1
arithmetic-expressions	hard	recursion	1
stone-division-2	medium	recursion	1
k-factorization	hard	recursion	1
bowling-pins	hard	recursion	1
simplified-chess-engine-ii	hard	recursion	1
repeat-k-sums	advanced	recursion	1
game-of-stones-1	easy	game theory	1
tower-breakers-1	easy	game theory	1
a-chessboard-game-1	easy	game theory	1
nim-game-1	easy	game theory	1
misere-nim-1	easy	game theory	1
nimble-game-1	easy	game theory	1
alice-and-bobs-silly-game	medium	game theory	1
poker-nim-1	easy	game theory	1
tower-breakers-revisited-1	medium	game theory	1
tower-breakers-again-1	medium	game theory	1
zero-move-nim	medium	game theory	1
chessboard-game-again-1	medium	game theory	1
digits-square-board-1	medium	game theory	1
fun-game-1	medium	game theory	1
stone-division	hard	game theory	1
chocolate-in-box	medium	game theory	1
kitty-and-katty	medium	game theory	1
powers-game-1	medium	game theory	1
deforestation-1	medium	game theory	1
bob-and-ben	medium	game theory	1
tower-breakers-the-final-battle-1	medium	game theory	1
simple-game	hard	game theory	1
permutation-game	medium	game theory	1
move-the-coins	hard	game theory	1
benders-play	medium	game theory	1
newyear-game	medium	game theory	1
stone-piles	hard	game theory	1
chocolate-game	hard	game theory	1
the-prime-game	hard	game theory	1
vertical-rooks	medium	game theory	1
half	medium	game theory	1
taste-of-win	expert	game theory	1
walking-the-approximate-longest-path	hard	np complete	1
sams-puzzle	advanced	np complete	1
spies-revised	expert	np complete	1
tbsp	expert	np complete	1
prime-date	medium	debugging	1
minimum-operations	medium	debugging	1
strings-xor	easy	debugging	1
zig-zag-sequence	medium	debugging	1
smart-number	easy	debugging	1
bfsshortreach	medium	graph theory	3
reduced-string	easy	strings	10
strong-password	easy	strings	10
two-characters	easy	strings	10
caesar-cipher-1	easy	strings	10
mars-exploration	easy	strings	10
hackerrank-in-a-string	easy	strings	10
pangrams	easy	strings	10
weighted-uniform-string	easy	strings	10
separate-the-numbers	easy	strings	10
funny-string	easy	strings	10
gem-stones	easy	strings	10
alternating-characters	easy	strings	10
beautiful-binary-string	easy	strings	10
the-love-letter-mystery	easy	strings	10
determining-dna-health	hard	strings	10
palindrome-index	easy	strings	10
anagram	easy	strings	10
making-anagrams	easy	strings	10
two-strings	easy	strings	10
string-construction	easy	strings	10
sherlock-and-valid-string	medium	strings	10
richie-rich	medium	strings	10
maximum-palindromes	medium	strings	10
sherlock-and-anagrams	medium	strings	10
common-child	medium	strings	10
bear-and-steady-gene	medium	strings	10
morgan-and-a-string	expert	strings	10
count-strings	hard	strings	10
string-function-calculation	advanced	strings	10
challenging-palindromes	advanced	strings	10
build-a-string	hard	strings	10
gridland-provinces	hard	strings	10
cards-permutation	expert	strings	10
ashton-and-string	advanced	strings	10
string-similarity	expert	strings	10
super-functional-strings	advanced	strings	10
circular-palindromes	advanced	strings	10
similar-strings	advanced	strings	10
save-humanity	expert	strings	10
find-strings	expert	strings	10
palindromic-border	expert	strings	10
two-two	advanced	strings	10
two-strings-game	expert	strings	10
letter-islands	expert	strings	10
pseudo-isomorphic-substrings	expert	strings	10
how-many-substrings	expert	strings	10
\.


--
-- TOC entry 2970 (class 0 OID 16397)
-- Dependencies: 202
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: maurice
--

COPY public.users (discord_id, hr_username, score, last_challenge_slug, total_resolved, total_unknown_resolved) FROM stdin;
101349875632	lburn38l	0	null	0	0
215194426945961987	louis_gombert	240	bfsshortreach	5	1
184340706859548672	Gennady	3470	diverse-strings	27	149
633035703575642122	uwi	69070	mancala6	341	859
\.


--
-- TOC entry 2843 (class 2606 OID 16423)
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: maurice
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (slug);


--
-- TOC entry 2841 (class 2606 OID 16404)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: maurice
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (discord_id);


-- Completed on 2020-07-29 00:26:35 CEST

--
-- PostgreSQL database dump complete
--

