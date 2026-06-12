Approach: Convert ipxe.efi to ISO (simpler)

# Download prebuilt ipxe.efi
wget https://boot.ipxe.org/ipxe.efi

# Create ISO
xorriso -as mkisofs -o ipxe.iso -b ipxe.efi -no-emul-boot \
  -isohybrid-mbr /usr/lib/GRUB/efimbridge.bin \
  -c boot.cat \
  -V "iPXE" \
  -l \
  --allow-disc \
  -e ipxe.efi \
  -b ipxe.efi \
  /dev/null

# Or with genisoimage + xorriso
mkdir iso_root
cp ipxe.efi iso_root/ipxe.efi
cat > iso_root/boot.ipxe << 'EOF'
#!ipxe
kernel http://<server>/vmlinuz ip=dhcp root=/dev/ram0 ramdisk_size=...
initrd http://<server>/initrd.img
boot
EOF

xorriso -as mkisofs -o ipxe.iso -b iso_root/ipxe.efi -no-emul-boot \
  -isohybrid-mbr -c boot.cat -V "iPXE" -l iso_root

Key point: The boot.ipxe file can be included in the ISO or hosted alongside ipxe.efi — the EFI firmware can load it directly via the iPXE shell:

#!ipxe
chain http://<server>/boot.ipxe || shell
