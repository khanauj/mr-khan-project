# Create stitch_screens directory if it does not exist
$outputDir = Join-Path $PSScriptRoot "stitch_screens"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Created directory: $outputDir"
}

# Array of screens with title, screenshot url, and html url
$screens = @(
    @{
        name = "01_ai_career_blueprint_dashboard"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0uhZrS37bY2bWBpV07AyJ9xhfSsxSG2wh6itdvbl42vOjbHP-RZJiAtC28DmHswZiJ1X1cj62d6WfyMdBVeXgQj9o1eZFlSiCVQ6wEQZBH27aQYq4XLkCXOVGwkSXAncPfi7T2kaYjJlhDeg-g81l5d_zXBxp8j4yND6SvfOmjG-Lg0_sBRJg7p3si-g29mKTDMH8Czh06ZeXT9k-8mNT_ZSyhqXsVrKeplI-uYyLLti29EUk0Eyb9YoQOO3"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzMwYTc2Mjk1Nzk0YTQ1ZGQ4M2EyMzliYzMzNWUyOGZjEgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "02_skillence_premium_ai_career_intelligence"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0uiSUTe7iVpbb082MWtIrblymicaFbWwT6gRBV_ce4JHOxZkSMuyOWLTQKB_k3DXNPjQGFGZvbwyZTkIh3Tr9FcX0JCqIf5f4D9QCZA5gFa91T84xYpjDvC_qBTzzlwp5UNddesvxZV1zl4BpCQTw7_7-7usIfJaKBlKEur2siNcEzAbEOsXpTxEStJHM0R0S8yHYhXRU_DIn7YqKWpqvFF4Ffv14FqC_P_cMBpXELCOqttgk_4eSEpBUFZx"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2FhODJhMTJiNDJlMTRjZmJiZDQ3NjUwN2RlZDlkMGI4EgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "03_ai_career_prediction_dashboard_premium_2026_animated"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0uhTcu1vFaZaqiy4AzPvz3Z9NeYz2mOvhmBn5GdYJQ6ND9C6-miOQjehMRzrvNFT3JqCuZSxE2_WAf0KvBDpwCy0kOSArTZZ5Rf55B-ItBA9AC8_AT0yvlvWaHVLX9sDWD3zWOsphFgHkWpcuTdJrD0D-2HgWtp8Te2aamWtEaE67OP9y6xZMRM9-XS2LFCj4J-AIlDDk-V3lmxjBVHiQGVyRLR9dEO_4VOl3HfW7czAi1aY22BY5PrVyXmM"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzE2NjZkNDNiNDkzYTQ1YmViYWVmZmYzZTc3YjZkODQxEgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "04_skill_gap_analysis_premium_2026_experience_animated"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0uj0tFPFEVcReh74zAxv173ZRvcqokKkrTN56YI4bOmsiNAIsF02vGXywXJ_eXhEysHkqEO5cdsP9vepMp9aMyf7G5Ekb-21q-hEZfKlfVzHXyoQuRqb08eOX18BHFYR-hbq99W6E90NM6RhjzyQhDDXLmVdqwSgIC_B-K18MgVsZQVn4x_nfHR8Sbo56SnwZVViFzGDuAx4qmWWw_5I3TOgSRxRDlpCOyADTMJffboryEIhv_E55OPlgvc"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzE3Y2IzM2I4NTNiYjQ4MGY4ZjVkYzc0MTE5Yzc1YjE5EgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "05_resume_intelligence_land_more_interviews_with_ai"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0uiSPF5I_KdW6HIAas11J2ZVjvophuf8yjVzF9-XOMHi0n_iHoR28n2WUzw1NPdGEyYXoTSYrMUIOYgJCQcDCh77WZCcZBrftmwXtuR_hajnop57wHQl2gMAlYOzxBzFiMc9oJxIpSET1xLxFknMgnrISj1YAROH7aUFIm7c5-xkbwin-1NiaSlQYpI6hip8clkda6pv1oksIiMpxbRoUDbjjmJkPJGeGRiFzxnneXgQGMHcjBWs1K0f5gqY"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzY5Nzc4Nzc2NjRiNzQzMzE4NTFhYzAxNDk4M2NhYTM4EgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "06_your_ai_career_transition_plan_premium_2026_experience"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0ui65_8XqKwWQjokfvQ06gu-t9r80wlbYv06oZOa9dN6KCSrHqCqj4AFzNVAscVk9JndOvidGU_4jBbGHIZzm3LTHGY_aao4plbKf_xJ1qBXPbHjQoIt492hzbhAwJocUcLzsxx-azYkT9HokDQR_5wP9KtYg750kEd5p8M9QiAg5tLbkN9AKp1Lwjf2fEP-oae-Yl93ekUY-CDj7biw-8-kij-WgH-gCZKlaVD5ZSYKv2Ah0CmW1yfzBxgn"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2JlODY4MjRmYmE2MDQzMTI5ZjZjNzhkMWMwNzQ5ZGU4EgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "07_career_comparison_premium_ai_experience"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0ujuavkMmwE36oxX1mNQPlMvB4uhyM3dWysV94veh3DOvdiW1Hfb7n8U6Lea7chSHZQ1a7SbOwvGJWqGt3oWgv5hHxt_k8-u3PEajx6y4LhjMn3nfeip4c-evPWDogC7K-QEDKyWCGDBL1E5Y8N8L8BkFTsCErbEbWIvJMS4KgnKievB1HD87Em25ZLKzF4ADtlttYC6OBxdEGTvUpIyyTEPYLiSeTUl2okRusb8zigL89IcKPGN4CXbX9c"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2ZlYmI1NTdiNGMwZjQwYTdiNDRkZjZlOTE2YTFjZTU2EgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "08_linkedin_profile_optimization_premium_ai_experience"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0ujY0h5dCbd_EHcO12TYy2-VwYy4VycI2cP0kSMM0I9_8sizjtTPzAbpIMsv9ol-7mYLLDZog0Si5AL1xLoDxXHMs73Ic3pFxdoxZiSYz92Nbd_3CWvnZThuuBDC06poOWDsvKGF7NiszPscunUj24IUXCaKr6BSI6xpgjtGYJ8amY35BnQSm0FQF3vgJIDPMSiWdET4cNDNb0z3COpifBlFVW65-MWCJ2gM7wL66oJnEohKFdmttV9RAtFa"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2RlMWY5MmQ0NDI0ZTQ3M2FiNDhkYzhmZTE3NjAzN2NiEgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "09_your_ai_career_journey_premium_2026_experience"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0ujGMgAhgxGbfBKpx3Vd7ei4bihDB2AvUcg2ew-xxzllh2v36yV0NQ1M0mB2r4ZwQpEi3aeaN2YUoWODQLFqtjtHPCZRS3KBgZy5PoxuxDQx88hyfEMQkygscYbD4CYLBsb8namunj8XA9IWIdhUpOFn2BOCLjcRVC1UEu9zVB5L53tRgGmgD2L3VlLjj0XDnzO48ZdNAQaN1bu9wZUBi2anxlsApwlhMpK_FDYk1LkzXKIgyGci92qDcUpB"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzk5ZmFhZjI3ZDQ3NTQ3M2ZhNjA2NTY4NzAzZjFkZWU1EgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "10_ai_control_center_admin_access"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0ugVPOtKwXr6xcpWfN71IqjMLhFHi2K2Fv5iuoEnXbAVAuTU1vecdoQeEDeCcYhZONugVpYhgrdSl928McSvD5E4nPQQIwfQErHdpdDLfFO0OB3cgSBgdSeouaqviPjaEz7e5-RuHqOu6fwpLe3W17g0H1CP-1gnV9hQxbF9SSih2YRkSlwSmPIB46yuwYT4dahg2O1RluA_wIWIlVjNWuZN-o-Da_mYyIthdYW-HSeaO1O-Q8IPwmYFq1vK"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzRhYmI5MDAxMTdmMTRlMzViM2NkYjBmMWNhODI2YjEyEgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "11_skillence_ai_career_copilot_premium_2026_experience"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0uiyrQgM3gyQtFrbmPG5rDhQnn-kTzF_YlH5DfmRgnB67DpQgGf_FQMKSPnQmiNWAvgd3JjhT-JaRUoTn5gcasVK8SPU2SchqJ_PdheVVw3TFInfx8rLFl43xNFegfJF-iPxFW792tYlX6jQwW9yVQVJVdi1hRtnqbR59_oUbIWm7y-tdiIOAZVnK7ReM8aYhbJyY89dMfeA-AY3skPGrCJIEjH13qg_pzvXJj5DxK6rRWCdmQx2Ex1amG4"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzU5ZGYyZmNhNmMxZDRkOTFhYTlmN2UzYjAwODE2MWEzEgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "12_start_your_ai_interview_premium_setup_experience"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0uhC4mETuzwfTMXUd7SFMjs8hL3qsbTn60LpjJS4Y2HhFt4-kituW9-dmhRRtfd5uJ7LLDqLLvKm44ywcX6jtOfXH9Z21-_15bpd1YTl9wwbTvWBvjxdcu4EXzR9kCdj0KWuHdXY_JOhWkxxSxRKvvK3R4IKds5q-6oMKXIq-bwidDbdfwaFpHmJnTVIOovkDX3O1BBZcgZomZouh62GBzTAFUAB1xvvY2yzmqhrJBKLsIwFy-skYArLxmea"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQ4YTE1Mzk4ZmNhMDRhZTA5YTU5MDA2MWI1YjYyN2E4EgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "13_live_ai_interview_session_immersive_experience"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0ugJTYfDHbFWc7NvFBBs_pLXpoLoW3txPSxsrOQL3H03CEfnoZomYIHocCjLrsA_9FTXVUlsd-yfNrkA43Uj-BIHxEC33a7r0AYFwxh1vou3E6anq4ybu4IFcOSPwlS59yXNAA01fYHZKB588ZzJVQ2fj1mW4s73FgX7lKfT2W5ol4YYW249WThhcbH4OCwDjCEaSOjYxZ3S28xwM3i-Uaz6p4Q9EQg7KaonfTM2UQp1Mwc4rTNSgDdEKgyN"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQxYTIyNTg4YmM2MDQ4MGM5OWRiMDRhYjEwNjZkNzFkEgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    },
    @{
        name = "14_the_minds_behind_skillence_premium_2026_ai_experience"
        image_url = "https://lh3.googleusercontent.com/aida/ADBb0uigrCqJFPyLrIv6HmifyOFJQP_ONyAq-s0Gn8u7FCShai1dC2KiySekDsm5on1drVTmPN9gGfRHeZBNKx2fbNSNgHDpO_RiFXwp8BVgVWOdo9e00bWqakRNwM56ceYQznRZBUc-2ycnUww8NUT0c0ZJHjLaatutG0729OyKfDaVbVnw8H2-OAUzwy2hFSX8w5DvsPPUFNmwPi9plIsaeKnDd7KvYcONZmzYJyoUcPCJYfN42zgSy1Q92sLx"
        html_url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2YyMGY2ODE3ZjA5MjRhNzdhYTE4NjY2ZGFlMzQyZjhkEgsSBxDl_6KR2h8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNDg0MTUwMTg0ODMxMjA5MTk0OA&filename=&opi=89354086"
    }
)

foreach ($screen in $screens) {
    $name = $screen.name
    $imgDest = Join-Path $outputDir "$name.png"
    $htmlDest = Join-Path $outputDir "$name.html"

    Write-Host "Downloading image for $name..."
    curl.exe -L -o $imgDest $screen.image_url

    Write-Host "Downloading HTML code for $name..."
    curl.exe -L -o $htmlDest $screen.html_url
}

Write-Host "All downloads complete!"
