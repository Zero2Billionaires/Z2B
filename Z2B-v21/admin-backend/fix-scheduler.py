#!/usr/bin/env python3
"""Fix server.js to wrap scheduler in try-catch"""

with open('server.js', 'r') as f:
    lines = f.readlines()

# Find and replace lines 120-121
new_lines = []
for i, line in enumerate(lines, 1):
    if i == 120 and line.strip() == '// Initialize MAVULA Cron Scheduler':
        # Replace with try-catch wrapped version
        new_lines.append('    // Initialize MAVULA Cron Scheduler (wrapped in try-catch to prevent crashes)\n')
        new_lines.append('    try {\n')
        new_lines.append("        require('./jobs/mavulaScheduler');\n")
        new_lines.append("        console.log('✅ MAVULA Scheduler initialized successfully');\n")
        new_lines.append('    } catch (error) {\n')
        new_lines.append("        console.error('⚠️ MAVULA Scheduler failed to initialize:', error.message);\n")
        new_lines.append("        console.error('Server will continue running without automated scheduling');\n")
        new_lines.append('    }\n')
    elif i == 121 and "require('./jobs/mavulaScheduler')" in line:
        # Skip this line (already added inside try block)
        continue
    else:
        new_lines.append(line)

# Write back
with open('server.js', 'w') as f:
    f.writelines(new_lines)

print('✅ server.js fixed successfully')
