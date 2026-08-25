using Microsoft.AspNetCore.DataProtection;

namespace ManPass1.Services
{
    public class PasswordEncryptionService
    {
        private readonly IDataProtector _protector;

        public PasswordEncryptionService(IDataProtectionProvider provider)
        {
            _protector = provider.CreateProtector("ManPass1.VaultPasswords");
        }

        public string Encrypt(string plainText)
        {
            return _protector.Protect(plainText);
        }

        public string Decrypt(string encryptedText)
        {
            return _protector.Unprotect(encryptedText);
        }
    }
}