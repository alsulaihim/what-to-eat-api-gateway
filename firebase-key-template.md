# Firebase Private Key Template

## Current Issue
Your `.env` file currently has:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

The `...` needs to be replaced with your actual private key content.

## How to Get the Full Private Key

1. **Open your Firebase service account JSON file** that you downloaded
2. **Find the `private_key` field** - it will look like:
   ```json
   {
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQD...\n-----END PRIVATE KEY-----\n"
   }
   ```

3. **Copy the entire private_key value** (including quotes)

## How to Format for .env File

Replace the `FIREBASE_PRIVATE_KEY` line in your `.env` file with:

```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDSbfRZ5RfoahG1\\ni3p6IXS0oeFZhdlaPDC0gc8Wp4uudgehjTehxT6/5icFDN2IrYotaQ5SQb8QIz9E\\nHRutgW715y36nyWIZxO/IMqGIsEXewP6OSCCuBdRJ3zv6KP4p+0czxQll6E8yDYx\\nJF/ViSq7fW+dkyvCAhhrGd/tos6SIr0FBc9VmP2UyQfOhWmuJqiJmSdEr41owPHO\\nKJG3rtG6QM1tsgXdMZLezbWVE399dHX52P8phKNtbPR/58pY4lhHylUeVSawhW7E\\neG0T9lhZgibdNy7YmJKcDxSEUGvV8eE6hlJs7hyriJFtY+HW2vbOi7OZjTyNQwDZ\\n10qOhiQ1AgMBAAECggEAMuHhjwclY86aH6LtZ7DFTpRCMGp8JyScxlkJITo8PWBO\\n8hJ6nERcqvxU/RSiUNVdryNTEjLRp25OcwLy2V6N3SocZRisc7IxBStBrXOj6zCU\\nwqGjqdgn0zjQLha753l7jVbJUVm75D2pVPKtta2oRpPLNHgMwanOC7/C9OxENPN+\\n4/MHLRtb9iqUwaEAnXYI+5+mZGtIa5KpYKxMchDRr4wL6GB4Zfmv2HS52FbaXfAe\\ni0dp+GQLWgY18TLJg8VwFT6KkKj24VZy9XY1TU70XOm7P0L9f7+ZMNn3BCHH2aeF\\nri37JaYGYLfEb3NOzVXFd6npku7yg3XBoG4k5xCi4QKBgQD5pfsI1dUmXZ4JJOvW\\nmN6OBoXBy0Wi/SMOalX2WQCs9kZkIYP7V+ntjY0HHHOSTzVHNFyIg6fVKUGUT/rb\\nYXMjM6yqzH2BYpcwVowp3qoly2ostOlGjFvsrJpnsfdGaY33kF24ycmseiKliDBl\\nudypmf07KAh74g3x+bNF/YpcuQKBgQDXyIg6oaYAlCDRlo7DZMiSrK3yLbw5sVaR\\nKII4ZtFdSL1v3ZiqDhc704uiKRGcO+O1UM2WVHndHHPgqDt3CvdHYwEXU6zojPXI\\ngM4GcV87lmlkpdpj/zHTXuMHSQGSs4+WzAo9mFUL8UMz+RuKMIfw4BxmXnrsaJTz\\nHoAsew2dXQKBgQDfLIVlGZup54juzcXTGufh+Wy7mRdQpJEhQuhECL604Jh+zQNq\\nvuXNynvnfoTGp+6OD/4kv+Vahr4scu9kDRLbxkc2jQYpk1RrDwPQLlDW5qis/LGJ\\nstI+mvKRfqP6m0QhqzpNhn62pJyydDQnzGa6a4HYz2n+LVCgH8Qm7ogxaQKBgQDQ\\nnmbe0KPOkWe9WiNCU3D7JYmyx3bgDEzWYGStpPIrjwTfX02Ws7LQu3CXYb9N3jUD\\nelCZU6jSFg0OGXgMWoTB9rz6UYKs/oMtyyHk5r0cvgm9LgAbh4EjiuxRgcrMi196\\nemA4NsualTHU0LVIgC0du36ZliSf5WiEOGvRFVMPXQKBgQCCNctDMXMoHbOATVA1\\naOvcAXSAVtbMw/Lky8Y1yrBqA7dBuZdBAW6W7eQ67FRc2X8Ta9DARTrQCQ7cibZP\\n70T9IzPCbBiuySchPXWVMnd4oyL9YwKBzow/sc46s7KiwnXhqpa8LeHeNcX+XDrK\\nKBYa5mt9ZsBEi7YAbUwc33ZdnQ==\\n-----END PRIVATE KEY-----"
```

**Important**: 
- This must be **ONE SINGLE LINE** in the .env file
- Replace the middle section with your actual private key content from the JSON file
- Use `\\n` (double backslash n) for newlines, not actual line breaks
- Keep it all within double quotes

## Alternative: Use Environment Variable directly

Instead of the `.env` file, you can set it directly:

```bash
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n[YOUR_ACTUAL_KEY]\\n-----END PRIVATE KEY-----"
npm run start:dev
```

The key should be around 1,700+ characters long when properly formatted.