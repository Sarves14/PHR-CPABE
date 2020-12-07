import java.util.*;
import java.io.*;
import java.security.SecureRandom; 
import java.util.Scanner; 
import javax.crypto.Cipher; 
import javax.crypto.KeyGenerator; 
import javax.crypto.SecretKey; 
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.spec.IvParameterSpec; 
import javax.xml.bind.DatatypeConverter;
import cpabe.Common;
import cpabe.Cpabe;
import java.util.regex.*;
import static java.lang.System.currentTimeMillis;


public class Setup{ 
	private static final String AES= "AES"; 
  	private static final String AES_CIPHER_ALGORITHM= "AES/CBC/PKCS5PADDING";
	
	public static SecretKey decodeKeyFromString(String keyStr) {
	    byte[] decodedKey = Base64.getDecoder().decode(keyStr);
		SecretKey secretKey = new SecretKeySpec(decodedKey, 0,
    	32, "AES");

  		return secretKey;
 	}


 	public static byte[] createInitializationVector(){ 
  		byte[] initializationVector= new byte[16]; 
        SecureRandom secureRandom= new SecureRandom(); 
        secureRandom.nextBytes(initializationVector); 
        return initializationVector; 
    }


    public static byte[] encrypt(String plainText,SecretKey secretKey,byte[] initializationVector) throws Exception { 
        Cipher cipher= Cipher.getInstance(AES_CIPHER_ALGORITHM); 
  		IvParameterSpec ivParameterSpec= new IvParameterSpec("asdjgbasdjkbpoiu".getBytes()); 
  
        cipher.init(Cipher.ENCRYPT_MODE,secretKey,ivParameterSpec); 
  
        return cipher.doFinal(plainText.getBytes()); 
    }


    public static String do_AESDecryption(byte[] cipherText,SecretKey secretKey,byte[] initializationVector) throws Exception{ 
        Cipher cipher= Cipher.getInstance(AES_CIPHER_ALGORITHM); 
  		IvParameterSpec ivParameterSpec= new IvParameterSpec("asdjgbasdjkbpoiu".getBytes()); 
  
        cipher.init(Cipher.DECRYPT_MODE,secretKey,ivParameterSpec); 
  
        byte[] result= cipher.doFinal(cipherText); 
  
        return new String(result); 
    }
	
	public static void main(String args[]) throws Exception
	{ 
		//Generating Public key and Master key
		Cpabe cpabe= new Cpabe();
		





		//Getting PHR
		FileInputStream fin=new FileInputStream("nvalue.txt");
		byte b[] = new byte[1024];
		fin.read(b);
		String s=""; 
		for(int i=0;i<b.length;i++){
			if(b[i]==0){
				break;
			}	
			s=s+(char)b[i];
		}
		int n=Integer.parseInt(s.trim());
		
	
		
		//Getting classes of PHR and perform encryption	
		byte pol_byte[]=Common.suckFile("policy.txt");
		String policy[]=(new String(pol_byte)).split(";");
		long time1=System.currentTimeMillis();
		for(int i=1;i<=n;i++){
			//Generating Hash parameter		 
			String c_policy=policy[i-1].trim();
			byte data_byte[]=Common.suckFile("data"+i+".txt");
			OneWayHash h= new OneWayHash();
			if(c_policy.charAt(c_policy.length()-1)=='+'){
			
				byte[] symmetrickey_string_byte=Common.suckFile("origkey"+i+".txt");
				String symmetrickey_string=new String(symmetrickey_string_byte);	
				SecretKey symmetrickey=decodeKeyFromString(symmetrickey_string);
				String pt=(new String(data_byte)).trim();

			//Encryption
				byte[] initializationVector= createInitializationVector();
				byte[] ct= encrypt(pt,symmetrickey,initializationVector);
				Common.spitFile("CT"+i+".txt", ct);
				continue;
			}

			

			Random rand = new Random(); 
			long rand1 = rand.nextLong(); 
			long rand2 = rand1+1; 
			String hash_param=""+rand1+rand2; 
			
			//Generating Symmetric Key
			
			String symmetrickey_string= h.toHexString(h.getSHA(hash_param));
			Common.spitFile("origkey"+i+".txt",symmetrickey_string.getBytes());
			SecretKey symmetrickey=decodeKeyFromString(symmetrickey_string);
			
		
			String pt=(new String(data_byte)).trim();

			//Encryption
			byte[] initializationVector= createInitializationVector();
			byte[] ct= encrypt(pt,symmetrickey,initializationVector);
			
			Common.spitFile("CT"+i+".txt", ct);
			

			
			
			//Encryption of symmetric key
			cpabe.enc("keys\\public.txt",c_policy,symmetrickey_string.getBytes(),"encrypt"+i+".txt");
  
		}
		long time2=System.currentTimeMillis();	
		System.out.println("Time for encryption in(ms): "+(time2-time1));
	} 
} 
