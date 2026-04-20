from resume_scoring.project_scorer import project_scorer
from resume_scoring.experience_scorer import experience_scorer
from resume_scoring.parsability_scorer import character_scorer, design_penalty_scorer

def resume_score(raw_text, extracted_json, resume_type, design_details):
    projects = extracted_json.get('projects', [])
    experiences = extracted_json.get('experience', [])

    project_scores = {}
    for project in projects:
        title = project.get('title') or "Untitled Project"
        project_scores[title] = project_scorer(
            project.get('description', ''), 
            project.get('tech_stack', [])
        )
    
    experience_scores = {}
    for exp in experiences:
        role = exp.get('role') or "Unknown Role"
        experience_scores[role] = experience_scorer(exp, exp.get('skills', []))

    proj_score = sum(project_scores.values()) / len(project_scores.values()) if project_scores else 0
    exp_score = sum(experience_scores.values()) / len(experience_scores.values()) if experience_scores else 0

    char_score = character_scorer(raw_text, extracted_json)
    des_penalty= design_penalty_scorer(design_details, resume_type)

    final_base = (
        0.20 * char_score +
        0.30 * exp_score +
        0.20 * proj_score +
        0.20 * (100 - des_penalty)
    )

    return {
        'Total Score' : final_base,
        'project score' : proj_score,
        'experience score' : exp_score,
        'Design penalty': des_penalty,
        "Character score": char_score       
    }