#!/bin/bash

# Fix Silver tier (Button text "Get Silver")
sed -i 's|onclick="window\.open('\''https://wa\.me/27774901639?text=Hi!%20I%20want%20to%20sign%20up%20for%20Copper%20tier%20(R999/month)'\'', '\''_blank'\'')">\s*Get Silver|onclick="window.open('\''https://wa.me/27774901639?text=Hi!%20I%20want%20to%20sign%20up%20for%20Silver%20tier%20(R1,480/month)'\'', '\''_blank'\'')">\n                            Get Silver|' index.html

# Fix Gold tier (Button text "Start Building")
sed -i 's|onclick="window\.open('\''https://wa\.me/27774901639?text=Hi!%20I%20want%20to%20sign%20up%20for%20Copper%20tier%20(R999/month)'\'', '\''_blank'\'')">\s*Start Building|onclick="window.open('\''https://wa.me/27774901639?text=Hi!%20I%20want%20to%20sign%20up%20for%20Gold%20tier%20(R2,980/month)'\'', '\''_blank'\'')">\n                            Start Building|' index.html

# Fix Platinum tier (Button text "Go Platinum")
sed -i 's|onclick="window\.open('\''https://wa\.me/27774901639?text=Hi!%20I%20want%20to%20sign%20up%20for%20Copper%20tier%20(R999/month)'\'', '\''_blank'\'')">\s*Go Platinum|onclick="window.open('\''https://wa.me/27774901639?text=Hi!%20I%20want%20to%20sign%20up%20for%20Platinum%20tier%20(R4,980/month)'\'', '\''_blank'\'')">\n                            Go Platinum|' index.html

# Fix Lifetime tier (Button text "Go Lifetime")
sed -i 's|onclick="window\.open('\''https://wa\.me/27774901639?text=Hi!%20I%20want%20to%20sign%20up%20for%20Copper%20tier%20(R999/month)'\'', '\''_blank'\'')">\s*Go Lifetime|onclick="window.open('\''https://wa.me/27774901639?text=Hi!%20I%20want%20to%20sign%20up%20for%20Lifetime%20tier%20(R29,999%20one-time)'\'', '\''_blank'\'')">\n                            Go Lifetime|' index.html

# Fix CTA Section button (Button text "Start Your 7-Day Free Trial")
sed -i 's|onclick="window\.open('\''https://wa\.me/27774901639?text=Hi!%20I%20want%20to%20sign%20up%20for%20Copper%20tier%20(R999/month)'\'', '\''_blank'\'')">\s*<i class="fas fa-rocket"></i> Start Your 7-Day Free Trial|onclick="window.location.href='\''#tiers'\''">\n                    <i class="fas fa-rocket"></i> Start Your 7-Day Free Trial|' index.html

echo "All tiers fixed!"
