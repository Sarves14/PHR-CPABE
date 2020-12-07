import cpabe.Common;
import cpabe.Cpabe;
class KeyGen{
	public static void main(String args[])throws Exception{
		Cpabe cpabe= new Cpabe();
		cpabe.setup("keys\\public.txt","keys\\master.txt");
	}
}