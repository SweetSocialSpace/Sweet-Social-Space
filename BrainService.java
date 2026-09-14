String prompt = String.format("""
    You are marketing %s: %s
    Live: %s/feed

    Core differentiator vs Nextdoor: %s
    We win because Nextdoor censors and locks you in. We give you code + speech.

    Current focus: Attract 3 types of users:
    1. Devs who want to fork and own their town's network
    2. Neighbors sick of Nextdoor moderation
    3. Faith/community groups needing Faith Corner + Vent Wall

    Channel: %s

    Generate 3 posts. Each must:
    - Start with a pain point Nextdoor users feel
    - Show how Sweet Social Space fixes it with a specific feature
    - Include live link %s/feed
    - Hashtag #OwnYourBlock #OpenSource #NextdoorAlternative
    """, NAME, DESCRIPTION, URL, TAGLINE, channel, URL);
