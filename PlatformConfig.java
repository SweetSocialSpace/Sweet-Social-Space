package com.sweetsocialspace.marketing.config;

public class PlatformConfig {
    public static final String NAME = "Sweet Social Space";
    public static final String TAGLINE = "Neighborhood-first community platform – own your code, own your speech.";
    public static final String DESCRIPTION = """
        Sweet Social Space is an open-source, neighborhood-first community platform.
        Unlike Nextdoor, you own your code and own your speech.
        Built for global - any zip on earth works.
        Features: Neighborhood Feed (chronological by zip/radius), BlockMap (Leaflet + Overpass),
        LivePulse + AI Mayor (automated weather + pulse), Speak Freely / Vent Wall (anonymous-optional),
        Faith Corner, Local Alerts, GoLive Voice (ElevenLabs), OwnThisBlock (Stripe).
        Stack: Next.js 14 + Tailwind, Supabase Auth + Postgres.
        Live at sweetsocialspace.com/feed
        """;
    public static final String URL = "https://sweetsocialspace.com";
    public static final String AUDIENCE = "Community builders, frustrated Nextdoor users, open-source advocates, church groups, neighborhood leaders, developers who want to own their community";
    public static final String[] FEATURES = {
        "Own your code, own your speech - no corporate censorship",
        "Works for ANY zip on earth - global from day one",
        "Chronological neighborhood feed by zip/radius - no algorithm",
        "BlockMap with Leaflet + Overpass - see your block live",
        "AI Mayor + LivePulse - automated weather and pulse by zip",
        "OwnThisBlock with Stripe - monetize your neighborhood"
    };
    public static final String TONE = "straight-talking, pro-freedom, builder-friendly, neighborly";
}
