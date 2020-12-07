import java.util.*;
import java.io.*;
import java.security.SecureRandom; 
import java.util.Scanner; 
import javax.crypto.Cipher; 
import javax.crypto.KeyGenerator; 
import javax.crypto.SecretKey; 
import static java.lang.System.currentTimeMillis;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.spec.IvParameterSpec; 
import javax.xml.bind.DatatypeConverter;
import cpabe.Cpabe;
import cpabe.Common;
import java.util.regex.*;

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
		
		//Getting attributes
		FileInputStream fin=new FileInputStream("attributes.txt");
		byte b[] = new byte[1024];
		fin.read(b);
		String s=""; 
		for(int i=0;i<b.length;i++){
			if(b[i]==0){
				break;
			}	
			s=s+(char)b[i];
		}
		String record[]=s.split("\n"); 
		int n=Integer.parseInt(record[0].trim());
		String attributes[]=record[1].split(",");
		TreeSet<String>attr=new TreeSet<>();
		for(int i=0;i<attributes.length;i++){
			attr.add(attributes[i]);
		}
		String attributes_arr[]=new String[attr.size()];
		attributes_arr=attr.toArray(attributes_arr);
	
		
		//Generating Secret key
		cpabe.keygen("public.txt","secret.txt","master.txt",attributes_arr);
		//Getting classes of PHR and perform encryption	
		long time1=System.currentTimeMillis();
		for(int i=0;i<n;i++){
			byte[] initializationVector= createInitializationVector();
			byte temp[]=new byte[1024];

			byte[] symmetricbyte=Common.suckFile("symmetrickeys"+i+".txt");

			if(new String(symmetricbyte).equals("true")){
				System.out.println("Key already decrypted skipping process");
				byte[] dec_key_byte=Common.suckFile("decrypt"+i+".txt");
				byte data[]=Common.suckFile("data"+i+".txt");
				if((new String(dec_key_byte)).equals("error")){
					System.out.println("not authorized");
				    Common.spitFile("plaintext"+i+".txt","".getBytes());

			    }
				else{
			        String dt= do_AESDecryption(data,decodeKeyFromString(new String(dec_key_byte)),initializationVector);
    	            Common.spitFile("plaintext"+i+".txt",dt.getBytes());
    	    	}
			}
			else{		
			//decryption of symmetric key
  			cpabe.dec("public.txt","secret.txt","symmetrickeys"+i+".txt","decrypt"+i+".txt");
  			fin=new FileInputStream("decrypt"+i+".txt");
  			fin.read(temp);
  			String dec_key="";
  			for(int j=0;i<temp.length;j++){
			if(temp[j]==0){
				break;
			}	
			dec_key=dec_key+(char)temp[j];
			}
  			

			
			byte data[]=Common.suckFile("data"+i+".txt");
			if((new String(dec_key)).equals("error")){
				System.out.println("not authorized");
				Common.spitFile("plaintext"+i+".txt","".getBytes());

			}
			else{
			
			String dt= do_AESDecryption(data,decodeKeyFromString(dec_key),initializationVector);
    	    
    	    Common.spitFile("plaintext"+i+".txt",dt.getBytes());
    	    
   	    	}	
		}

		}
		long time2=System.currentTimeMillis();	
		System.out.println("Time for decryption in(ms): "+(time2-time1));
	} 
} 
