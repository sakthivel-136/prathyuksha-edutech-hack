from auth import supabase as sb
import json

def debug_seating_v2():
    # 1. Fetch some exams to get valid IDs
    exam_res = sb.table('exams').select('id, department, year_of_study, course_name').limit(5).execute()
    exams_data = exam_res.data or []
    print("--- Exams Sample ---")
    print(json.dumps(exams_data, indent=2))
    
    if not exams_data:
        print("No exams found in DB.")
        return

    depts = list(set(e['department'] for e in exams_data if e.get('department')))
    years = list(set(e['year_of_study'] for e in exams_data if e.get('year_of_study')))
    
    print(f"\nSearching for students in Depts: {depts}, Years: {years}")
    
    # 2. Check user_profiles matching
    student_query = sb.table('user_profiles').select('*').eq('role', 'student')
    if depts: student_query = student_query.in_('department', depts)
    if years: student_query = student_query.in_('year_of_study', years)
    
    students_res = student_query.execute()
    raw_students = students_res.data or []
    
    print(f"\nFound {len(raw_students)} total matching students.")
    if raw_students:
        print("\n--- Student Sample ---")
        print(json.dumps(raw_students[:3], indent=2))
        
        # 3. Simulate the mapping
        mapped_count = 0
        for prof in raw_students:
            matching_exam = next((e for e in exams_data if 
                                e['department'] == prof['department'] and 
                                e['year_of_study'] == prof['year_of_study']), None)
            if matching_exam:
                mapped_count += 1
        
        print(f"\nSuccessfully mapped {mapped_count} students to specific exams.")

if __name__ == "__main__":
    debug_seating_v2()
