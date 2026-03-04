import joblib
try:
	clf1 = joblib.load('backend/models/student_pass_classifier.pkl')
	print("Student Pass Classifier type:", type(clf1))
	clf3 = joblib.load('backend/models/early_warning_rf.pkl')
	print("Early warning RF type:", type(clf3))
	print("Early warning RF score:", getattr(clf3, 'oob_score_', 'No OOB score'))
except Exception as e:
	print(e)
