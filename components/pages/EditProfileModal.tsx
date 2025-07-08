import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { VolunteerProfile } from "@/store/api/volunteer";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<VolunteerProfile>) => void;
  volunteer: VolunteerProfile;
}

export function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  volunteer,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    personalInfo: {
      fullname: volunteer?.personalInfo?.fullname || "",
      age: volunteer?.personalInfo?.age || "",
      gender: volunteer?.personalInfo?.gender || "",
    },
    contactInfo: {
      phone: volunteer?.contactInfo?.phone || "",
      email: volunteer?.contactInfo?.email || "",
      address: volunteer?.contactInfo?.address || "",
      location: volunteer?.contactInfo?.location || { lat: 0, lng: 0 },
      contactPreference: volunteer?.contactInfo?.contactPreference || "",
    },
    skills: {
      certifications: {
        cprTrained: volunteer?.skills?.certifications?.cprTrained || false,
        firstAidTrained:
          volunteer?.skills?.certifications?.firstAidTrained || false,
      },
      skillsList: volunteer?.skills?.skillsList || [],
      availability: volunteer?.skills?.availability || [],
    },
  });

  const handleInputChange = (
    section: string,
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleCertificationChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        certifications: {
          ...prev.skills.certifications,
          [field]: value,
        },
      },
    }));
  };

  const handleSkillsChange = (skills: string) => {
    const skillsArray = skills.split(",").map((skill) => skill.trim());
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        skillsList: skillsArray,
      },
    }));
  };

  const handleAvailabilityChange = (availability: string) => {
    const availabilityArray = availability
      .split(",")
      .map((time) => time.trim());
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        availability: availabilityArray,
      },
    }));
  };

  const handleSubmit = () => {
    onSave(formData as Partial<VolunteerProfile>);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Personal Information</h3>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    value={formData.personalInfo.fullname}
                    onChange={(e) =>
                      handleInputChange(
                        "personalInfo",
                        "fullname",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.personalInfo.age}
                    onChange={(e) =>
                      handleInputChange("personalInfo", "age", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={formData.personalInfo.gender}
                    onChange={(e) =>
                      handleInputChange(
                        "personalInfo",
                        "gender",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Contact Information</h3>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.contactInfo.phone}
                    onChange={(e) =>
                      handleInputChange("contactInfo", "phone", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) =>
                      handleInputChange("contactInfo", "email", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.contactInfo.address}
                    onChange={(e) =>
                      handleInputChange(
                        "contactInfo",
                        "address",
                        e.target.value
                      )
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your full address for emergency response coordination
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Skills & Certifications</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cprTrained">CPR Trained</Label>
                  <Switch
                    id="cprTrained"
                    checked={formData.skills.certifications.cprTrained}
                    onCheckedChange={(checked) =>
                      handleCertificationChange("cprTrained", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="firstAidTrained">First Aid Trained</Label>
                  <Switch
                    id="firstAidTrained"
                    checked={formData.skills.certifications.firstAidTrained}
                    onCheckedChange={(checked) =>
                      handleCertificationChange("firstAidTrained", checked)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={formData.skills.skillsList.join(", ")}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="availability">
                    Availability (comma-separated)
                  </Label>
                  <Input
                    id="availability"
                    value={formData.skills.availability.join(", ")}
                    onChange={(e) => handleAvailabilityChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 bg-background pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="ml-2">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
