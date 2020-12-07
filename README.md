# PHR-CPABE
Securing patients health records in cloud using CP-ABE

Concept:  
1.Patient classifies their health records into number of classes of data and   
provide policies for who can access which classes of those data.  
  
2.2 Layer encryption  
  1.The patients health records are encrypted using symmetric key encryption(AES).  
  2.Those symmetric keys are again encrypted using Cipher Text Policy Based Encryption(CP-ABE)   
  based on policy provided by patients.  
  
3.All the keys are uploaded into cloud.  
  
4.Decryption  
  1.Medical worker with some speciality(like nurse) enters the patient name.  
  2.Get the keys and perform attribute based(speciality) decryption and  
  get the symmetric keys.  
  3.Symmetric key decrytion is done and Medical worker gets the required   
  and authorized patient health record.  
  
Advantage of this implementation:  
  1.There are lot of chances that for the policies provided by the patients already  
  encryption is done so encryption time can be reduced if we reuse those encrypted values.  
  2.Here a policy manager maintain the list of all the policies given by all users.  
  3.The policy manager will be in some secured server but here it implemented along with the normal server  
  4.It checks the database if incoming policy already exists or not if exists it returns the encrypted key  
  so that there is no need for performing the encryption for the policy again.  
  5.Thus the encryption time will be reduced.  
  
  
Modules:  
  There are three modules   
  1.mp_patient  
    1.Run this moudle in a local machine.  
    2.It host a front end for patient side.  
    3.Hit localhost:5000 in your browser.  
    4.Divide the patient health record into classes of records(For eg. Details related diabetes can form one file  
    and Details related to neurological problems can form one file).  
    5.Give the polciy for those each class.  
    6.Policy should be in this format "neurologist chiefdoctor 1of2"(medical worker should be either neurologist or chief doctor.'1'   
    represents the number of attribute he should satisfy '2' represents total number of attributes).  
    7.node local server will accept the request, call java for encryption, make server call  
    and store it in mongodb database mentioned in server.  
      
  2.mp_server  
    1.Run this module in a cloud platform.For debugging purpose run this on local machine.port is 3000.  
    2.accepts the encrypted records from patient side and put that in mongodb databse.  
    3.policy manager maintains all the policies provided by all the patients.  
    4.when medical worker request for particular patient returns the particular  
    encrypted record.  
      
  3.mp_medical    
    1.Run this moudle in a local machine.  
    2.It host a front end for medical worker side.  
    3.Hit localhost:2000 in your browser.  
    4.Give the medical worker name,his speciality,patient name.  
    5.node local server will accept the request, make server call, get the patient decrypted data, call java for decryption.   
    and display it in the medical worker front end.  
  