Add-Type -AssemblyName System.Windows.Forms

# Criar uma imagem PNG mínima em bytes
$pngBytes = @(
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT chunk
    0x54, 0x78, 0x9C, 0x63, 0xF8, 0x0F, 0x00, 0x00,
    0x01, 0x01, 0x00, 0x05, 0x87, 0xEE, 0xE0, 0xE5,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,  # IEND chunk
    0xAE, 0x42, 0x60, 0x82
)

$imagePath = "C:\Users\jarde\OneDrive\Desktop\Farmácia - Projeto Final  para deploy\test-image.png"
[System.IO.File]::WriteAllBytes($imagePath, $pngBytes)
Write-Host "✅ Imagem de teste criada: $imagePath"

# Obter token (você precisa fazer login primeiro e copiar o token)
$tokenForm = New-Object System.Windows.Forms.Form
$tokenForm.Text = "Teste de Upload"
$tokenForm.Width = 500
$tokenForm.Height = 200

$label = New-Object System.Windows.Forms.Label
$label.Text = "Cole o token JWT (após fazer login):"
$label.Width = 400
$label.Height = 30
$label.Location = New-Object System.Drawing.Point(10, 10)

$textBox = New-Object System.Windows.Forms.TextBox
$textBox.Width = 460
$textBox.Height = 40
$textBox.Location = New-Object System.Drawing.Point(10, 50)
$textBox.Multiline = $true

$button = New-Object System.Windows.Forms.Button
$button.Text = "Testar Upload"
$button.Width = 100
$button.Height = 40
$button.Location = New-Object System.Drawing.Point(10, 100)
$button.Add_Click({
    $global:token = $textBox.Text.Trim()
    $tokenForm.Close()
})

$tokenForm.Controls.Add($label)
$tokenForm.Controls.Add($textBox)
$tokenForm.Controls.Add($button)
$tokenForm.ShowDialog()

if (-not $global:token) {
    Write-Host "❌ Token não fornecido"
    exit
}

Write-Host "Token recebido (primeiros 20 chars): $($global:token.Substring(0, [Math]::Min(20, $global:token.Length)))..."

# Preparar o upload
Write-Host "`n🔄 Iniciando upload..."

# Usar .NET para enviar multipart/form-data
$boundary = [System.Guid]::NewGuid().ToString()
$body = New-Object System.IO.MemoryStream

# Escrever o boundary e headers do campo
$boundaryBytes = [System.Text.Encoding]::ASCII.GetBytes("--$boundary`r`n")
$body.Write($boundaryBytes, 0, $boundaryBytes.Length)

$headerBytes = [System.Text.Encoding]::ASCII.GetBytes("Content-Disposition: form-data; name=`"image`"; filename=`"test-image.png`"`r`nContent-Type: image/png`r`n`r`n")
$body.Write($headerBytes, 0, $headerBytes.Length)

# Escrever o arquivo
$fileBytes = [System.IO.File]::ReadAllBytes($imagePath)
$body.Write($fileBytes, 0, $fileBytes.Length)

# Escrever o boundary final
$finalBoundaryBytes = [System.Text.Encoding]::ASCII.GetBytes("`r`n--$boundary--")
$body.Write($finalBoundaryBytes, 0, $finalBoundaryBytes.Length)

$body.Seek(0, [System.IO.SeekOrigin]::Begin) | Out-Null

# Enviar requisição
$uri = "http://localhost:3000/admin/upload"
$headers = @{
    "Authorization" = "Bearer $($global:token)"
}

try {
    Write-Host "Enviando para: $uri"
    Write-Host "Content-Type: multipart/form-data; boundary=$boundary"
    
    $response = Invoke-WebRequest -Uri $uri `
        -Method POST `
        -Headers $headers `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body.ToArray() `
        -ErrorAction Stop

    Write-Host "`n✅ Upload bem-sucedido!"
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Resposta: $($response.Content)"
} catch {
    Write-Host "`n❌ Erro no upload:"
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Resposta: $($_.Exception.Response | ConvertTo-Json)"
    Write-Host "Erro: $($_.Exception.Message)"
}

Write-Host "`n✅ Teste finalizado"
